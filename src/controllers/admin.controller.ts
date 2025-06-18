import { Response } from "express";
import bcrypt from "bcrypt";
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
