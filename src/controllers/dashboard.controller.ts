// controllers/dashboardController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Type untuk query parameters
interface DashboardQuery {
  period?:
    | "today"
    | "this_week"
    | "this_month"
    | "last_month"
    | "this_year"
    | "all";
  limit?: string;
}

// GET /api/dashboard/stats
export const getDashboardStats = async (
  req: Request<{}, {}, {}, DashboardQuery>,
  res: Response,
) => {
  try {
    const { period = "all" } = req.query;

    // Set date range berdasarkan period
    const dateFilter = getDateRange(period);

    // Hitung semua statistik secara paralel
    const [
      totalUsers,
      totalDebt,
      totalPaid,
      activeCycles,
      overdueCycles,
      recentPaymentsCount,
    ] = await Promise.all([
      // 1. Total Users
      prisma.user.count(),

      // 2. Total Utang Aktif (isPaid = false)
      prisma.debtCycle.aggregate({
        where: { isPaid: false },
        _sum: { total: true },
      }),

      // 3. Total Terbayar (dari Payment)
      prisma.payment.aggregate({
        where: dateFilter.payment
          ? {
              paidAt: dateFilter.payment,
            }
          : {},
        _sum: { amount: true },
      }),

      // 4. Active Cycles (belum lunas)
      prisma.debtCycle.count({
        where: { isPaid: false },
      }),

      // 5. Overdue Cycles (belum lunas dan created lebih dari 30 hari)
      prisma.debtCycle.count({
        where: {
          isPaid: false,
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 hari lalu
          },
        },
      }),

      // 6. Recent Payments (7 hari terakhir)
      prisma.payment.count({
        where: {
          paidAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const stats = {
      totalUsers,
      totalDebt: totalDebt._sum.total || 0,
      totalPaid: totalPaid._sum.amount || 0,
      pendingDebt: (totalDebt._sum.total || 0) - (totalPaid._sum.amount || 0),
      activeCycles,
      overdueCycles,
      recentPaymentsCount,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard",
    });
  }
};

// GET /api/dashboard/recent-payments
export const getRecentPayments = async (
  req: Request<{}, {}, {}, DashboardQuery>,
  res: Response,
) => {
  try {
    const { limit = "5" } = req.query;

    const payments = await prisma.payment.findMany({
      take: parseInt(limit),
      orderBy: { paidAt: "desc" },
      include: {
        user: {
          select: { name: true },
        },
        cycle: {
          select: { total: true },
        },
      },
    });

    const formattedPayments = payments.map((p) => ({
      id: p.id,
      user: p.user.name,
      amount: p.amount,
      paidAt: p.paidAt,
      status: "paid",
      totalDebt: p.cycle.total,
    }));

    res.json({
      success: true,
      data: formattedPayments,
    });
  } catch (error) {
    console.error("Recent payments error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data pembayaran terbaru",
    });
  }
};

// GET /api/dashboard/top-debtors
export const getTopDebtors = async (
  req: Request<{}, {}, {}, DashboardQuery>,
  res: Response,
) => {
  try {
    const { limit = "5" } = req.query;

    const topDebtors = await prisma.user.findMany({
      where: {
        cycles: {
          some: {
            isPaid: false,
          },
        },
      },
      include: {
        cycles: {
          where: { isPaid: false },
          select: { total: true },
        },
      },
    });

    // Hitung total debt per user
    const debtorsWithTotal = topDebtors.map((user) => {
      const totalDebt = user.cycles.reduce(
        (sum, cycle) => sum + cycle.total,
        0,
      );
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        totalDebt,
        cyclesCount: user.cycles.length,
      };
    });

    // Sort dari debt terbesar
    const sortedDebtors = debtorsWithTotal
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: sortedDebtors,
    });
  } catch (error) {
    console.error("Top debtors error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data top debtors",
    });
  }
};

// GET /api/dashboard/overview
export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    // Ambil semua data sekaligus untuk performa lebih baik
    const [stats, recentPayments, topDebtors] = await Promise.all([
      // Stats
      (async () => {
        const totalDebt = await prisma.debtCycle.aggregate({
          where: { isPaid: false },
          _sum: { total: true },
        });

        const totalPaid = await prisma.payment.aggregate({
          _sum: { amount: true },
        });

        return {
          totalUsers: await prisma.user.count(),
          totalDebt: totalDebt._sum.total || 0,
          totalPaid: totalPaid._sum.amount || 0,
          activeCycles: await prisma.debtCycle.count({
            where: { isPaid: false },
          }),
          overdueCycles: await prisma.debtCycle.count({
            where: {
              isPaid: false,
              createdAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        };
      })(),

      // Recent payments (5 terbaru)
      prisma.payment.findMany({
        take: 5,
        orderBy: { paidAt: "desc" },
        include: {
          user: { select: { name: true } },
          cycle: { select: { total: true } },
        },
      }),

      // Top debtors (5 teratas)
      (async () => {
        const users = await prisma.user.findMany({
          where: {
            cycles: { some: { isPaid: false } },
          },
          include: {
            cycles: {
              where: { isPaid: false },
              select: { total: true },
            },
          },
        });

        return users
          .map((user) => ({
            id: user.id,
            name: user.name,
            totalDebt: user.cycles.reduce((sum, cycle) => sum + cycle.total, 0),
            cyclesCount: user.cycles.length,
          }))
          .sort((a, b) => b.totalDebt - a.totalDebt)
          .slice(0, 5);
      })(),
    ]);

    const pendingDebt = stats.totalDebt - stats.totalPaid;

    const formattedPayments = recentPayments.map((p) => ({
      id: p.id,
      user: p.user.name,
      amount: p.amount,
      paidAt: p.paidAt,
      status: "paid",
      totalDebt: p.cycle.total,
    }));

    res.json({
      success: true,
      data: {
        stats: {
          ...stats,
          pendingDebt,
        },
        recentPayments: formattedPayments,
        topDebtors,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard",
    });
  }
};

// Helper function untuk date range
interface DateFilter {
  payment?: {
    gte?: Date;
    lte?: Date;
  };
  debt?: {
    gte?: Date;
    lte?: Date;
  };
}

function getDateRange(period: string = "all"): DateFilter {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "today":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "this_week":
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      break;
    case "this_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        payment: {
          gte: startDate,
          lte: endDate,
        },
        debt: {
          gte: startDate,
          lte: endDate,
        },
      };
    case "this_year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default: // 'all'
      return {};
  }

  return {
    payment: { gte: startDate },
    debt: { gte: startDate },
  };
}
