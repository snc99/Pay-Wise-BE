import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { paymentSchema } from "../validations/payment.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { formatZodError } from "../utils/zodErrorFormatter";

export const getPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.DebtCycleWhereInput = {
      ...(search
        ? {
            user: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          }
        : {}),
    };

    const [cycles, total] = await Promise.all([
      prisma.debtCycle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true },
          },
          payment: true,
        },
      }),
      prisma.debtCycle.count({ where }),
    ]);

    const items = cycles.map((c) => ({
      id: c.id,
      user: {
        id: c.user.id,
        name: c.user.name,
      },
      total: c.total,
      isPaid: c.isPaid,
      paidAt: c.payment?.paidAt ?? null,
      amountPaid: c.payment?.amount ?? 0,
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data pembayaran berhasil diambil",
      data: {
        items,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: formatZodError(parsed.error),
    });
    return;
  }

  const { userId, amount, paidAt } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cycle = await tx.debtCycle.findFirst({
        where: {
          userId,
          isPaid: false,
        },
        include: { user: true },
      });

      if (!cycle) throw new Error("NO_ACTIVE");

      if (amount !== cycle.total) throw new Error("AMOUNT_MISMATCH");

      const payment = await tx.payment.create({
        data: {
          cycleId: cycle.id,
          userId,
          amount,
          paidAt: new Date(paidAt),
        },
      });

      await tx.debtCycle.update({
        where: { id: cycle.id },
        data: {
          isPaid: true,
          paidAt: new Date(paidAt),
        },
      });

      return {
        cycleId: cycle.id,
        total: cycle.total,
        paidAt: payment.paidAt,
        user: cycle.user,
      };
    });

    res.status(201).json({
      success: true,
      message: `${result.user.name} berhasil melunasi utang.`,
      data: result,
    });
  } catch (err: any) {
    if (err.message === "NO_ACTIVE") {
      res.status(400).json({ message: "User tidak punya utang aktif" });
      return;
    }

    if (err.message === "AMOUNT_MISMATCH") {
      res.status(400).json({ message: "Jumlah tidak sesuai total" });
      return;
    }

    if (err.code === "P2002") {
      res.status(400).json({ message: "Tagihan ini sudah dibayar" });
      return;
    }

    next(err);
  }
};

export const deleteCycle = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { cycleId } = req.params;

    const cycle = await prisma.debtCycle.findUnique({
      where: { id: cycleId },
      include: {
        user: true,
      },
    });

    if (!cycle) {
      res.status(404).json({
        success: false,
        message: "Tagihan tidak ditemukan",
      });
      return;
    }

    await prisma.$transaction([
      prisma.debt.deleteMany({
        where: { cycleId },
      }),
      prisma.payment.deleteMany({
        where: { cycleId },
      }),
      prisma.debtCycle.delete({
        where: { id: cycleId },
      }),
    ]);

    res.json({
      success: true,
      message: `Tagihan ${cycle.user.name} berhasil dihapus permanen`,
    });
  } catch (err) {
    next(err);
  }
};
