import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";
import { redis } from "../utils/redis"; // <- pastikan ini benar path-nya

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token tidak ditemukan" });
    return;
  }

  try {
    // ⛔ Cek apakah token sudah di-blacklist (logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({ message: "Token sudah logout" });
      return;
    }

    const decoded = verifyToken(token) as AuthenticatedUser;

    // Validasi role
    if (!Object.values(Role).includes(decoded.role)) {
      res.status(403).json({ message: "Role tidak valid" });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token tidak valid" });
  }
};
