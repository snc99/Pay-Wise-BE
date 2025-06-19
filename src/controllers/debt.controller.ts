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
    });

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan hutang",
      data: newDebt,
    });
  } catch (error) {
    console.error("POST /debt error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      res.status(400).json({
        success: false,
        message: "User yang dipilih tidak ditemukan.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan utang.",
    });
  }
};
