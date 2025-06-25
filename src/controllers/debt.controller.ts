import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import { debtSchema, deleteDebtParamsSchema } from "../validations/debt.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { formatZodError } from "../utils/zodErrorFormatter";

export const getAllDebts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.DebtWhereInput = search
      ? {
          user: {
            is: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        }
      : {};

    const [debts, totalDebts] = await Promise.all([
      prisma.debt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.debt.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Daftar debt berhasil diambil",
      data: {
        items: debts,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDebts / limit),
        totalItems: totalDebts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createDebt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = debtSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "Validasi gagal",
        errors: formatZodError(parsed.error),
      });
      return;
    }

    const { userId, amount, date } = parsed.data;

    const newDebt = await prisma.debt.create({
      data: {
        userId,
        amount: new Prisma.Decimal(amount),
        date: new Date(date),
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: `${newDebt.user.name} berhasil menambahkan utang.`,
      data: {
        userId: newDebt.userId,
        amount: newDebt.amount,
        date: newDebt.date,
        user: {
          name: newDebt.user.name,
        },
      },
    });
    return;
  } catch (err) {
    console.error("POST /debt error:", err);

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "User yang dipilih tidak ditemukan.",
      });
      return;
    }

    next(err);
  }
};

export const deleteDebt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = deleteDebtParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: 400,
      message: parsed.error.errors[0].message,
    });
    return;
  }

  const { id } = parsed.data;

  try {
    const debt = await prisma.debt.findUnique({
      where: { id },
      include: {
        user: true,
        payments: true,
      },
    });

    if (!debt) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Data utang tidak ditemukan.",
      });
      return;
    }

    // Cek utang ini sudah lunas
    const totalPayment = debt.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const isCurrentDebtLunas = totalPayment >= Number(debt.amount);

    // Cek apakah user punya utang lain yang belum lunas
    const otherDebts = await prisma.debt.findMany({
      where: {
        userId: debt.userId,
        id: { not: id },
      },
      include: { payments: true },
    });

    const hasUnpaidOtherDebt = otherDebts.some((d) => {
      const totalPaid = d.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      return totalPaid < Number(d.amount);
    });

    if (!isCurrentDebtLunas || hasUnpaidOtherDebt) {
      res.status(400).json({
        success: false,
        status: 400,
        message:
          "Tidak bisa menghapus utang karena masih ada utang yang belum lunas.",
      });
      return;
    }

    // Hapus utang
    await prisma.debt.delete({ where: { id } });

    res.status(200).json({
      success: true,
      status: 200,
      message: `Berhasil menghapus data utang ${debt.user.name}.`,
    });
    return;
  } catch (err) {
    next(err);
  }
};
