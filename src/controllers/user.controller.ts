import { NextFunction } from "express";
// controllers/user.controller.ts
import { Response } from "express";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  createUserSchema,
  deleteUserParamSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validations/user.schema";
import { Prisma } from "@prisma/client";
import { formatZodError } from "../utils/zodErrorFormatter";

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const search = (req.query.search as string) || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.UserWhereInput = search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      status: 200,
      message: "Daftar user berhasil diambil",
      data: {
        items: users,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalItems: totalUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const result = createUserSchema.safeParse(req.body);

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

  const { name, phone, address } = result.data;

  try {
    const newUser = await prisma.user.create({
      data: { name, phone, address },
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: `${newUser.name} berhasil ditambahkan`,
      data: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        address: newUser.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // ✅ Validasi parameter ID
  const parsedId = userIdParamSchema.safeParse(req.params);

  if (!parsedId.success) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi parameter gagal",
      errors: formatZodError(parsedId.error),
    });
    return;
  }

  const { id } = parsedId.data;

  // ✅ Validasi body
  const result = updateUserSchema.safeParse(req.body);
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

  const { name, phone, address } = result.data;

  // ✅ Pastikan minimal 1 field dikirim
  if (name === undefined && phone === undefined && address === undefined) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "Minimal satu field harus diisi.",
    });
    return;
  }

  try {
    // ✅ Pastikan user ada
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "User tidak ditemukan",
      });
      return;
    }

    // ✅ Bangun data update
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // ✅ Lakukan update
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `${updated.name} berhasil diperbarui`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const parsed = deleteUserParamSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: 400,
      message: parsed.error.errors[0].message,
    });
    return;
  }

  const { id } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        cycles: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "User tidak ditemukan.",
      });
      return;
    }

    const hasActiveCycle = user.cycles.some((c) => c.isPaid === false);

    if (hasActiveCycle) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "User masih memiliki utang yang belum lunas.",
      });
      return;
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "User berhasil dihapus.",
    });
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const query = (req.query.query as string) || "";
  const limit = parseInt(req.query.limit as string) || 10;

  // Optional validasi minimal 2 huruf untuk performa
  if (query.length > 0 && query.length < 2) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "Minimal 2 karakter untuk pencarian.",
    });
    return;
  }

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
      take: limit,
    });

    const options = users.map((user) => ({
      value: user.id,
      label: user.name,
    }));

    res.status(200).json({
      success: true,
      status: 200,
      message: "Daftar user berhasil diambil",
      data: {
        items: options,
      },
    });
  } catch (err) {
    next(err);
  }
};
