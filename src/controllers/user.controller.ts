import { NextFunction } from "express";
// controllers/user.controller.ts
import { Response } from "express";
import prisma from "../prisma/client";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  createUserSchema,
  deleteUserParamSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validations/user.schema";

export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
      status: 200,
      message: "Daftar user berhasil diambil",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Optional: Deteksi field tidak dikenal
  const allowedFields = ["name", "phone", "address"];
  const invalidFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: `Field tidak dikenal: ${invalidFields.join(", ")}`,
    });
  }

  // Validasi schema
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { name, phone, address } = parsed.data;

  try {
    const newUser = await prisma.user.create({
      data: { name, phone, address },
    });

    return res.status(201).json({
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
    next(err); // Ditangani middleware errorHandler
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // ✅ Validasi parameter ID
  const parsedId = userIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi parameter gagal",
      errors: parsedId.error.flatten().fieldErrors,
    });
  }

  const { id } = parsedId.data;

  // ✅ Deteksi field tidak dikenal
  const allowedFields = ["name", "phone", "address"];
  const invalidFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: `Field tidak dikenal: ${invalidFields.join(", ")}`,
    });
  }

  // ✅ Validasi body
  const parsedBody = updateUserSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: parsedBody.error.flatten().fieldErrors,
    });
  }

  const updateData = parsedBody.data;

  // ✅ Pastikan minimal satu field dikirim
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Minimal satu field harus diisi.",
    });
  }

  try {
    // ✅ Pastikan user ada
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "User tidak ditemukan",
      });
    }

    // ✅ Update user
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: `${updated.name} berhasil diperbarui`,
      data: updated,
    });
  } catch (err) {
    next(err); // akan ditangani middleware errorHandler
  }
};

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "User tidak ditemukan.",
      });
    }

    const debts = await prisma.debt.findMany({
      where: { userId: id },
      include: { payments: true },
    });

    const hasUnpaidDebt = debts.some((debt) => {
      const totalPaid = debt.payments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      return totalPaid < Number(debt.amount);
    });

    if (hasUnpaidDebt) {
      res.status(400).json({
        success: false,
        status: 400,
        message:
          "User masih memiliki utang yang belum lunas, tidak dapat dihapus.",
      });
    }

    await prisma.user.delete({ where: { id } });

    res.json({
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
  next: NextFunction
) => {
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
      status: 200,
      message: "Daftar user berhasil diambil",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};
