import bcrypt from "bcrypt";
import { NextFunction, Response } from "express";
import { redis } from "../utils/redis";
import prisma from "../prisma/client";
import { Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware"; // pastikan path sesuai
import {
  createAdminSchema,
  updateAdminSchema,
} from "../validations/admin.schema";
import { formatZodError } from "../utils/zodErrorFormatter";

export const getAllAdmins = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
                mode: "insensitive",
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
      status: 200,
      message: "Data admin berhasil diambil",
      data: {
        items: admins,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAdmins / limit),
        totalItems: totalAdmins,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = createAdminSchema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = formatZodError(result.error);

    res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: formattedErrors,
    });
    return;
  }

  const { username, password, role, email, name } = result.data;

  try {
    const existingUsername = await prisma.admin.findUnique({
      where: { username },
    });
    if (existingUsername) {
      res.status(409).json({
        success: false,
        status: 409,
        message: "Validasi gagal",
        errors: {
          username: [`Username ${username} sudah digunakan`],
        },
      });
      return;
    }

    const existingEmail = await prisma.admin.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(409).json({
        success: false,
        status: 409,
        message: "Validasi gagal",
        errors: {
          email: [`Email ${email} sudah digunakan`],
        },
      });
      return;
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
      status: 201,
      message: `${newAdmin.name} berhasil ditambahkan`,
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  // Validasi input
  const result = updateAdminSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = formatZodError(result.error);
    res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: formattedErrors,
    });
    return;
  }

  const { name, email, username, role, password } = result.data;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      res.status(404).json({ message: "Admin tidak ditemukan" });
      return;
    }

    // ✅ Cek duplikat username hanya jika dikirim
    if (username) {
      const existingUsername = await prisma.admin.findFirst({
        where: {
          username,
          id: { not: id },
        },
      });

      if (existingUsername) {
        res.status(409).json({
          success: false,
          status: 409,
          message: `Username ${username} sudah digunakan`,
          field: "username",
        });
        return;
      }
    }

    // ✅ Cek duplikat email hanya jika dikirim
    if (email) {
      const existingEmail = await prisma.admin.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (existingEmail) {
        res.status(409).json({
          success: false,
          status: 409,
          message: `Email ${email} sudah digunakan`,
          field: "email",
        });
        return;
      }
    }

    // ✅ Bangun updateData hanya dari field yang dikirim
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
      await redis.del(`token:${id}`); // force logout
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      status: 200,
      message: `${updated.name} berhasil diperbarui`,
      data: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  try {
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Admin tidak ditemukan",
      });
      return;
    }

    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "Anda tidak dapat menghapus akun Anda sendiri",
      });
      return;
    }

    await prisma.admin.delete({ where: { id } });

    res.json({
      success: true,
      status: 200,
      message: `${admin.name} berhasil dihapus`,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    next(err);
  }
};
