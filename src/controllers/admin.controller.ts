import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware"; // pastikan path sesuai

export const getAllAdmins = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (req.user?.role !== "SUPERADMIN") {
    res
      .status(403)
      .json({ message: "Hanya SUPERADMIN yang dapat melihat daftar admin" });
  }

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

  if (req.user?.role !== "SUPERADMIN") {
    res.status(403).json({
      message: "Hanya SUPERADMIN yang dapat membuat admin baru",
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
    message: "Admin berhasil dibuat",
    data: {
      id: newAdmin.id,
      username: newAdmin.username,
      role: newAdmin.role,
    },
  });
};

export const updateAdmin = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, username, role, password } = req.body;

  // Cek role: hanya SUPERADMIN yang boleh
  if (req.user?.role !== "SUPERADMIN") {
    res.status(403).json({
      message: "Hanya SUPERADMIN yang dapat mengedit admin",
    });
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    // Cek duplikat email/username
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
      res
        .status(409)
        .json({
          message: "Email atau username sudah digunakan oleh admin lain",
        });
    }

    // Siapkan data untuk update
    const updateData: any = { name, email, username, role };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "Admin berhasil diperbarui",
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Gagal update admin:", error);
    res.status(500).json({ message: "Gagal memperbarui admin" });
  }
};
