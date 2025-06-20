import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import { debtSchema } from "../validations/debt.schema";

export const getAllDebts = async (req: Request, res: Response) => {
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
      message: "Daftar debt berhasil diambil",
      data: debts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDebts / limit),
        totalItems: totalDebts,
      },
    });
  } catch (error) {
    console.error("GET /api/debt error:", error);
    res.status(500).json({ message: "Gagal mengambil data utang." });
  }
};

export const createDebt = async (req: Request, res: Response) => {
  try {
    const parsed = debtSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors[0];
      res.status(400).json({
        success: false,
        message: errorMessage.message,
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
      message: `${newDebt.user.name} berhasil menambahkan utang`,
      data: {
        userId: newDebt.userId,
        amount: newDebt.amount,
        date: newDebt.date,
        user: {
          name: newDebt.user.name,
        },
      },
    });
  } catch (error) {
    console.error("POST /debt error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      res.status(400).json({
        success: false,
        message: `"User yang dipilih tidak ditemukan."`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan utang.",
    });
  }
};

export const deleteDebt = async (req: Request, res: Response) => {
  const { id } = req.params;

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
        message: "Data utang tidak ditemukan",
      });
      return;
    }

    // Hitung sisa dari debt ini
    const totalPayment = debt.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    const isCurrentDebtLunas = totalPayment >= Number(debt.amount);

    // Cek semua utang lain user ini
    const otherDebts = await prisma.debt.findMany({
      where: {
        userId: debt.userId,
        id: { not: id }, // selain debt ini
      },
      include: { payments: true },
    });

    const hasUnpaidOtherDebt = otherDebts.some((d) => {
      const totalPaid = d.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      return totalPaid < Number(d.amount); // masih punya yang belum lunas
    });

    if (!isCurrentDebtLunas || hasUnpaidOtherDebt) {
      res.status(400).json({
        success: false,
        message:
          "Tidak bisa menghapus utang karena masih ada utang yang belum lunas",
      });
    }

    // Jika semua lunas
    await prisma.debt.delete({ where: { id } });

    res.json({
      success: true,
      message: `${debt.user.name} berhasil menghapus data utang.`,
    });
  } catch (error) {
    console.error("Gagal menghapus utang:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus utang.",
    });
  }
};
