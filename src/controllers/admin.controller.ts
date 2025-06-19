import bcrypt from "bcrypt";
import { Response } from "express";
import { redis } from "../utils/redis";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware"; // pastikan path sesuai

export const getAllAdmins = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.AdminWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive", // pakai string literal di sini
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [admins, totalAdmins] = await Promise.all([
      prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.admin.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: admins,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAdmins / limit),
        totalItems: totalAdmins,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data admin" });
  }
};

export const createAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const { username, password, role, email, name } = req.body;

  if (!username || !password || !role || !email || !name) {
    res.status(400).json({
      message: "Username, password, role, email, dan name wajib diisi",
    });
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    res.status(409).json({ message: "Username sudah terdaftar" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
      email,
      name,
      role,
    },
  });

  res.status(201).json({
    success: true,
    message: "Admin berhasil dibuat",
    data: {
      id: newAdmin.id,
      name: newAdmin.name,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
};

export const updateAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, username, role, password } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    const duplicate = await prisma.admin.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [{ email: email || "" }, { username: username || "" }],
          },
        ],
      },
    });

    if (duplicate) {
      res.status(409).json({
        message: "Email atau username sudah digunakan oleh admin lain",
      });
    }

    const updateData: any = { name, email, username, role };

    // Jika password ingin diubah
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;

      // ❌ Hapus token dari Redis (logout paksa)
      await redis.del(`token:${id}`);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Admin berhasil diperbarui",
      data: {
        id: updateData.id,
        name: updateData.name,
        username: updateData.username,
        email: updateData.email,
        role: updateData.role,
      },
    });
  } catch (error) {
    console.error("Gagal update admin:", error);
    res.status(500).json({ message: "Gagal memperbarui admin" });
  }
};

export const deleteAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin tidak ditemukan",
      });
      return;
    }

    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: "Anda tidak dapat menghapus akun Anda sendiri",
      });
      return;
    }

    await prisma.admin.delete({ where: { id } });

    res.json({
      success: true,
      message: "Berhasil",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Gagal menghapus admin:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus admin",
    });
  }
};
