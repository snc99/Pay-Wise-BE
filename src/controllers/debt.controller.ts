import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";
import { debtSchema } from "../validations/debt.schema";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { formatZodError } from "../utils/zodErrorFormatter";

export const getAllDebts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
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
          debts: {
            orderBy: { date: "desc" },
            take: 1,
            select: {
              note: true,
              date: true,
            },
          },
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
      paidAt: c.paidAt,
      createdAt: c.createdAt,
    }));

    res.status(200).json({
      success: true,
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

export const createDebt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
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

    const { userId, amount, date, note } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      let cycle = await tx.debtCycle.findFirst({
        where: { userId, isPaid: false },
      });

      if (!cycle) {
        try {
          cycle = await tx.debtCycle.create({
            data: { userId },
          });
        } catch (err: any) {
          if (err.code === "P2002") {
            cycle = await tx.debtCycle.findFirst({
              where: { userId, isPaid: false },
            });
          } else {
            throw err;
          }
        }
      }

      // 🛡️ ini bikin TS & runtime aman
      if (!cycle) {
        throw new Error("Failed to get or create active debt cycle");
      }

      const debt = await tx.debt.create({
        data: {
          cycleId: cycle.id,
          amount,
          note,
          date: new Date(date),
        },
      });

      const updatedCycle = await tx.debtCycle.update({
        where: { id: cycle.id },
        data: {
          total: { increment: amount },
        },
      });

      return { debt, cycle: updatedCycle };
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: "Utang berhasil ditambahkan",
      data: {
        cycleId: result.cycle.id,
        total: result.cycle.total,
        debt: {
          id: result.debt.id,
          amount: result.debt.amount,
          date: result.debt.date,
        },
      },
    });
  } catch (err) {
    console.error("POST /debt error:", err);
    next(err);
  }
};

export const getDebtItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cycleId } = req.params;

    const cycle = await prisma.debtCycle.findUnique({
      where: { id: cycleId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!cycle) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Debt cycle tidak ditemukan",
      });
      return;
    }

    const debts = await prisma.debt.findMany({
      where: { cycleId },
      orderBy: { date: "asc" },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Detail hutang berhasil diambil",
      data: {
        cycle: {
          id: cycle.id,
          total: cycle.total,
          isPaid: cycle.isPaid,
          paidAt: cycle.paidAt,
          user: cycle.user,
        },
        items: debts,
      },
    });
  } catch (err) {
    next(err);
  }
};

//  Mengembalikan daftar DebtCycle (invoice) yang belum lunas,
export const getOpenDebtCycles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const search = (req.query.search as string) || "";
  const limitRaw = parseInt(req.query.limit as string);
  const limit = isNaN(limitRaw) || limitRaw <= 0 ? 10 : Math.min(limitRaw, 50);

  try {
    const cycles = await prisma.debtCycle.findMany({
      where: {
        isPaid: false,
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
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const items = cycles.map((c) => ({
      cycleId: c.id,
      userId: c.user.id,
      userName: c.user.name,
      total: c.total,
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Daftar tagihan yang belum lunas",
      data: { items },
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicDebts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const search = (req.query.search as string) || "";

    const cycles = await prisma.debtCycle.findMany({
      where: {
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
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const items = cycles.map((c) => ({
      id: c.id,
      name: c.user.name,
      total: c.total,
      status: c.isPaid ? "paid" : "unpaid",
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data tagihan pelanggan",
      data: { items },
    });
  } catch (err) {
    next(err);
  }
};
