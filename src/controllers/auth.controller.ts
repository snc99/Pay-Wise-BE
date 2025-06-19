import prisma from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { redis } from "../utils/redis";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { removeToken } from "../utils/removeToken";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username dan password wajib diisi." });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      res.status(401).json({ message: "Username atau password salah." });
      return;
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      res.status(401).json({ message: "Username atau password salah." });
      return;
    }

    // ✅ Buat token setelah validasi berhasil
    const token = generateToken({
      id: admin.id,
      role: admin.role,
      username: admin.username,
    });

    // ✅ Hitung TTL dari token
    const jwtDecoded = jwt.decode(token) as { exp: number };
    const ttlInSeconds = jwtDecoded.exp - Math.floor(Date.now() / 1000);

    // ✅ Simpan token ke Redis
    await redis.set(`token:${admin.id}`, token, { ex: ttlInSeconds });

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
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
        message: "User tidak ditemukan",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profil pengguna berhasil diambil",
      user: admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
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
        message: "Token tidak valid",
      });
      return;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttlInSeconds = decoded.exp - nowInSeconds;

    if (ttlInSeconds <= 0) {
      res.status(400).json({
        success: false,
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
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Logout gagal",
    });
  }
};
