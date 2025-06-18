import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

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

    const token = generateToken({
      id: admin.id,
      role: admin.role,
      username: admin.username,
    });

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
