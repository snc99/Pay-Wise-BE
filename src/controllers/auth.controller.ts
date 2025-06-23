import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { redis } from "../utils/redis";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { removeToken } from "../utils/removeToken";
import { loginSchema } from "../validations/auth.schema";
import { loginService } from "../services/auth.service";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      status: 400,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { username, password } = parsed.data;

  try {
    const result = await loginService(username, password);

    if (!result) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Username atau password salah.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Login berhasil",
      token: result.token,
      user: result.user,
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      status: 401,
      message: "Unauthorized",
    });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!admin) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "User tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Profil pengguna berhasil diambil",
      user: admin,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      status: 401,
      message: "Token tidak ditemukan",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as { exp?: number; id?: string };

    if (!decoded?.exp) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "Token tidak valid",
      });
      return;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttlInSeconds = decoded.exp - nowInSeconds;

    if (ttlInSeconds <= 0) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "Token sudah kedaluwarsa",
      });
      return;
    }

    // Simpan token ke Redis blacklist
    await redis.set(`blacklist:${token}`, "true", { ex: ttlInSeconds });

    // Hapus token aktif dari Redis jika ada user.id
    if (decoded.id) {
      await removeToken(decoded.id);
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "Logout berhasil",
    });
  } catch (err) {
    next(err);
  }
};
