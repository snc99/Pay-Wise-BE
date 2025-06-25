import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import {
  deletePaymentParamsSchema,
  paymentSchema,
} from "../validations/payment.schema";
import { r } from "@upstash/redis/zmscore-DzNHSWxc";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.PaymentWhereInput = {
      deletedAt: null,
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

    // Grouping by debt
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

    // Calculate remainingCalculated
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

    // Enrich hasil akhir
    const enrichedResult = result.map((item) => ({
      ...item,
      totalRemaining: userRemainingMap.get(item.debt.user.id) || 0,
    }));

    const paginated = enrichedResult
      .sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      )
      .slice(skip, skip + limit);

    // ✅ Clean final data
    const cleanedResult = paginated.map((item) => ({
      id: item.id,
      amount: item.amount,
      paidAt: item.paidAt,
      userName: item.debt.user.name,
      remainingCalculated: item.remainingCalculated,
      totalRemaining: item.totalRemaining,
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data pembayaran berhasil diambil",
      data: {
        items: cleanedResult,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(enrichedResult.length / limit),
        totalItems: enrichedResult.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = paymentSchema.safeParse(req.body);

  if (!parsed.success) {
    const unknownField = parsed.error.issues.find(
      (issue) => issue.code === "unrecognized_keys"
    );

    if (unknownField) {
      res.status(400).json({
        success: false,
        status: 400,
        message: `Field tidak dikenal: ${unknownField.keys.join(", ")}`,
      });
      return;
    }

    res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { userId, amount, paidAt } = parsed.data;
  let remainingAmount = new Prisma.Decimal(amount);

  try {
    const { userId, amount, paidAt } = parsed.data;

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "User yang dipilih tidak ditemukan.",
      });
      return;
    }

    const userName = userExists.name;

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
        status: 400,
        message: "User yang dipilih tidak memiliki pencatatan.",
      });
      return;
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
        status: 400,
        message: "Nominal pembayaran melebihi total sisa utang user.",
      });
      return;
    }

    const createdPayments = await prisma.$transaction(
      paymentsToCreate.map((data) => prisma.payment.create({ data }))
    );

    res.status(201).json({
      success: true,
      status: 201,
      message: `Pembayaran ${userName} berhasil dicatat.`,
      data: createdPayments,
    });
    return;
  } catch (err) {
    console.error("POST /payment error:", err);
    return next(err);
  }
};

export const deletePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = deletePaymentParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: 400,
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
            payments: {
              where: {
                deletedAt: null, // Hanya payment aktif
              },
            },
            user: true,
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Pembayaran tidak ditemukan.",
      });
      return;
    }

    const totalPaid = payment.debt.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const debtAmount = Number(payment.debt.amount);
    const isDebtFullyPaid = totalPaid >= debtAmount;

    if (!isDebtFullyPaid) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "Pembayaran tidak bisa dihapus karena utang belum lunas.",
      });
      return;
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        deletedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: `Pembayaran berhasil dihapus untuk user ${payment.debt.user.name}.`,
    });
  } catch (err) {
    next(err);
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
            amount: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 🎯 Clean & format response
    const cleaned = deletedPayments.map((item) => ({
      id: item.id,
      amount: item.amount,
      remaining: item.remaining,
      paidAt: item.paidAt,
      userName: item.debt.user.name,
      totalDebt: item.debt.amount,
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data histori pembayaran berhasil diambil.",
      data: {
        items: cleaned,
      },
    });
  } catch (error) {
    console.error("GET /payment/history error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data histori pembayaran.",
    });
  }
};
