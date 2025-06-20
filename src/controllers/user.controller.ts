// controllers/user.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Daftar user berhasil diambil",
      data: users,
    });
  } catch (error) {
    console.error("Gagal mengambil daftar user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil user",
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, phone, address } = req.body;

  if (!name || !phone || !address) {
    res.status(400).json({
      success: false,
      message: "Semua field (name, phone, address) wajib diisi",
    });
    return;
  }

  try {
    const newUser = await prisma.user.create({
      data: { name, phone, address },
    });

    res.status(201).json({
      success: true,
      message: `${newUser.name} berhasil ditambahkan`,
      data: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        address: newUser.address,
      },
    });
  } catch (error) {
    console.error("Gagal membuat user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat user",
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { name, phone, address },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `${updated.name} berhasil diperbarui`,
      data: updated,
    });
  } catch (error) {
    console.error("Gagal update user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui user",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    // Ambil semua utang user
    const debts = await prisma.debt.findMany({
      where: { userId: id },
      include: { payments: true },
    });

    // Cek apakah semua utang sudah lunas
    const hasUnpaidDebt = debts.some((debt) => {
      const totalPaid = debt.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      return totalPaid < Number(debt.amount);
    });

    if (hasUnpaidDebt) {
      return res.status(400).json({
        success: false,
        message:
          "User masih memiliki utang yang belum lunas, tidak dapat dihapus.",
      });
    }

    // Jika semua lunas, hapus user
    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: "User berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus user.",
    });
  }
};

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  const query = (req.query.query as string) || "";

  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: 10,
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Gagal mencari user:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mencari user",
    });
  }
};
