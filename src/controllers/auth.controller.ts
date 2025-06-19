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
      message: "Login berhasil",
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        username: admin.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getProfile = (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.status(200).json({
    message: "Profil pengguna berhasil diambil",
    user,
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token tidak ditemukan" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.decode(token) as { exp?: number };

    if (!decoded?.exp) {
      res.status(400).json({ message: "Token tidak valid" });
      return;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttlInSeconds = decoded.exp - nowInSeconds;

    if (ttlInSeconds <= 0) {
      res.status(400).json({ message: "Token sudah kedaluwarsa" });
      return;
    }

    await redis.set(`blacklist:${token}`, "true", { ex: ttlInSeconds });

    const decodedUser = jwt.decode(token) as { id?: string };
    if (decodedUser?.id) {
      await removeToken(decodedUser.id);
    }

    res.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Logout gagal" });
  }
};
