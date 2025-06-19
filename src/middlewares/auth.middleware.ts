import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";
import { redis } from "../utils/redis";

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
    // 1. Cek blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({ message: "Token sudah logout" });
      return;
    }

    // 2. Decode & verifikasi token
    const decoded = verifyToken(token) as AuthenticatedUser;

    // 3. Cek apakah token masih aktif (tersimpan di Redis)
    const activeToken = await redis.get(`token:${decoded.id}`);
    if (!activeToken || activeToken !== token) {
      res
        .status(401)
        .json({ message: "Token tidak aktif lagi. Silakan login ulang." });
      return;
    }

    // 4. Cek role
    if (!Object.values(Role).includes(decoded.role)) {
      res.status(403).json({ message: "Role tidak valid" });
      return;
    }

    // 5. Lolos semua cek
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token tidak valid" });
  }
};
