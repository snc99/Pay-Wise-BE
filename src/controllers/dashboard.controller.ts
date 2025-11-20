// controllers/dashboard.controller.ts
import { NextFunction, Response } from "express";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function buildDateRange(from: Date, to: Date): string[] {
  const result: string[] = [];
  const current = new Date(from);

  while (current <= to) {
    result.push(formatDateISO(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * GET /api/dashboard/cards
 */
export const getCards = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();

    const totalDebtsResult = await prisma.debt.aggregate({
      _sum: { amount: true },
    });

    const totalPaymentsResult = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    const totalPaidUsers = await prisma.user.count({
      where: {
        debts: { some: { payments: { some: {} } } },
      },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data dashboard berhasil diambil",
      data: {
        totalUsers,
        totalDebts: Number(totalDebtsResult._sum.amount || 0),
        totalPayments: Number(totalPaymentsResult._sum.amount || 0),
        totalPaidUsers,
      },
    });
    return; // <<< IMPORTANT: do not return res
  } catch (err) {
    console.error("GET /api/dashboard/cards error:", err);
    next(err);
  }
};

/**
 * GET /api/dashboard/compare
 */
export const getComparison = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    if (from || to) {
      const fromDate = from ? new Date(String(from)) : new Date(0);
      const toDate = to ? new Date(String(to)) : new Date();

      const debtSum = await prisma.debt.aggregate({
        _sum: { amount: true },
        where: {
          date: { gte: fromDate, lte: toDate },
        },
      });

      const paymentSum = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paidAt: { gte: fromDate, lte: toDate },
        },
      });

      res.status(200).json({
        success: true,
        status: 200,
        message: "Data comparison berhasil diambil",
        data: {
          totalDebts: Number(debtSum._sum.amount || 0),
          totalPayments: Number(paymentSum._sum.amount || 0),
        },
      });
      return;
    }

    const totalDebts = await prisma.debt.aggregate({ _sum: { amount: true } });
    const totalPayments = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data comparison berhasil diambil",
      data: {
        totalDebts: Number(totalDebts._sum.amount || 0),
        totalPayments: Number(totalPayments._sum.amount || 0),
      },
    });
    return;
  } catch (err) {
    console.error("GET /api/dashboard/compare error:", err);
    next(err);
  }
};

/**
 * GET /api/dashboard/trends/daily-payments
 */
export const getDailyPaymentTrends = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const daysParam = req.query.days ? Number(req.query.days) : undefined;
    const fromQuery = req.query.from as string | undefined;
    const toQuery = req.query.to as string | undefined;

    let fromDate: Date;
    let toDate: Date = new Date();

    if (fromQuery && toQuery) {
      fromDate = new Date(fromQuery);
      toDate = new Date(toQuery);
    } else if (fromQuery) {
      fromDate = new Date(fromQuery);
    } else if (daysParam && daysParam > 0) {
      fromDate = new Date();
      fromDate.setDate(toDate.getDate() - (daysParam - 1));
    } else {
      fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 6);
    }

    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    const rows: Array<{ day: string; total: string }> = await prisma.$queryRaw`
      SELECT 
        to_char(date_trunc('day', "paidAt")::date, 'YYYY-MM-DD') as day,
        SUM("amount"::numeric)::text as total
      FROM "Payment"
      WHERE "paidAt" >= ${fromDate} AND "paidAt" <= ${toDate}
      GROUP BY day
      ORDER BY day ASC;
    `;

    const lookup = new Map<string, number>();
    rows.forEach((r) => lookup.set(String(r.day), Number(r.total)));

    const labels = buildDateRange(fromDate, toDate);
    const data = labels.map((d) => lookup.get(d) ?? 0);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Data pembayaran harian berhasil diambil",
      data: { labels, data },
    });
    return;
  } catch (err) {
    console.error("GET /api/dashboard/trends/daily-payments error:", err);
    next(err);
  }
};
