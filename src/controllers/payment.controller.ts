import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import {
  deletePaymentParamsSchema,
  paymentSchema,
} from "../validations/payment.schema";
import { r } from "@upstash/redis/zmscore-DzNHSWxc";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getPayments = async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.PaymentWhereInput = {
      deletedAt: null, // hanya payment yang belum dihapus
      ...(search
        ? {
            debt: {
              user: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          }
        : {}),
    };

    const allPayments = await prisma.payment.findMany({
      where,
      orderBy: [{ debtId: "asc" }, { paidAt: "asc" }],
      include: {
        debt: {
          select: {
            id: true,
            amount: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by debtId
    const groupedByDebt = new Map<
      string,
      { amount: number; items: typeof allPayments }
    >();

    for (const p of allPayments) {
      const key = p.debt.id;
      if (!groupedByDebt.has(key)) {
        groupedByDebt.set(key, {
          amount: Number(p.debt.amount),
          items: [],
        });
      }
      groupedByDebt.get(key)!.items.push(p);
    }

    // Calculate remainingCalculated per payment
    const result: any[] = [];
    for (const [, group] of groupedByDebt.entries()) {
      let remaining = group.amount;

      for (const p of group.items) {
        remaining -= Number(p.amount);
        result.push({
          ...p,
          remainingCalculated: remaining,
          totalRemaining: 0,
        });
      }
    }

    // Hitung totalRemaining per user
    const allDebts = await prisma.debt.findMany({
      include: {
        payments: true,
        user: true,
      },
    });

    const userRemainingMap = new Map<string, number>();
    for (const debt of allDebts) {
      const totalPaid = debt.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const remaining = Number(debt.amount) - totalPaid;
      const userId = debt.user.id;
      const prev = userRemainingMap.get(userId) || 0;
      userRemainingMap.set(userId, prev + remaining);
    }

    // Gabungkan dengan totalRemaining per user
    const enrichedResult = result.map((item) => ({
      ...item,
      totalRemaining: userRemainingMap.get(item.debt.user.id) || 0,
    }));

    const paginated = enrichedResult
      .sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      )
      .slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: paginated,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(enrichedResult.length / limit),
        totalItems: enrichedResult.length,
      },
    });
  } catch (error) {
    console.error("GET /payment error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data pembayaran.",
    });
  }
};

export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const parsed = paymentSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors[0];
      res.status(400).json({
        success: false,
        message: errorMessage.message,
      });
      return;
    }

    const { userId, amount, paidAt } = parsed.data;
    let remainingAmount = new Prisma.Decimal(amount);

    const debts = await prisma.debt.findMany({
      where: { userId },
      include: { payments: true },
      orderBy: { createdAt: "asc" },
    });

    const unpaidDebts = debts.filter((debt) => {
      const totalPaid = debt.payments.reduce(
        (acc, p) => acc.plus(p.amount),
        new Prisma.Decimal(0)
      );
      return debt.amount.minus(totalPaid).greaterThan(0);
    });

    if (unpaidDebts.length === 0) {
      res.status(400).json({
        success: false,
        message: "User tidak memiliki utang yang belum lunas.",
      });
    }

    const paymentsToCreate = [];

    for (const debt of unpaidDebts) {
      const totalPaid = debt.payments.reduce(
        (acc, p) => acc.plus(p.amount),
        new Prisma.Decimal(0)
      );
      const remainingDebt = debt.amount.minus(totalPaid);

      if (remainingDebt.lte(0)) continue;

      const paymentForThisDebt = Prisma.Decimal.min(
        remainingDebt,
        remainingAmount
      );

      paymentsToCreate.push({
        debtId: debt.id,
        amount: paymentForThisDebt,
        remaining: remainingDebt.minus(paymentForThisDebt),
        paidAt: new Date(paidAt),
      });

      remainingAmount = remainingAmount.minus(paymentForThisDebt);
      if (remainingAmount.lte(0)) break;
    }

    if (remainingAmount.gt(0)) {
      res.status(400).json({
        success: false,
        message: "Nominal pembayaran melebihi total sisa utang user.",
      });
    }

    const createdPayments = await prisma.$transaction(
      paymentsToCreate.map((data) => prisma.payment.create({ data }))
    );

    res.status(201).json({
      success: true,
      message: "Pembayaran berhasil dicatat",
      data: createdPayments,
    });
  } catch (error) {
    console.error("POST /payment error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mencatat pembayaran.",
    });
  }
};

export const deletePayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = deletePaymentParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: parsed.error.errors[0].message,
    });
    return;
  }

  const paymentId = parsed.data.id;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        debt: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment tidak ditemukan.",
      });
      return;
    }

    const totalPaid = payment.debt.payments
      .filter((p) => !p.deletedAt)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const debtAmount = Number(payment.debt.amount);
    const remaining = debtAmount - totalPaid;

    if (remaining !== 0) {
      res.status(400).json({
        success: false,
        message: "Payment tidak bisa dihapus karena utang belum lunas.",
      });
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Payment berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /payment/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus payment.",
    });
  }
};

// mengambil daftar pembayaran yang sudah dihapus (soft delete)
export const getDeletedPayments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const deletedPayments = await prisma.payment.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        paidAt: "desc",
      },
      include: {
        debt: {
          select: {
            id: true,
            amount: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: deletedPayments,
    });
  } catch (error) {
    console.error("GET /payment/history error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data histori pembayaran.",
    });
  }
};
