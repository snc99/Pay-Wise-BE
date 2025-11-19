// middlewares/auth.middleware.ts
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
  // Ambil token dari Authorization header (Bearer ...) terlebih dahulu
  const authHeader = req.headers.authorization;
  let token =
    authHeader && typeof authHeader === "string"
      ? authHeader.split(" ")[1]
      : undefined;

  // Fallback: ambil token dari cookie pw_token jika header tidak ada
  if (!token && (req as any).cookies && (req as any).cookies.pw_token) {
    token = (req as any).cookies.pw_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      status: 401,
      message: "Token tidak ditemukan",
    });
    return;
  }

  try {
    const trimmedToken = token.trim();

    // 1) cek blacklist
    const blacklistedValue = await redis.get(`blacklist:${trimmedToken}`);
    if (blacklistedValue) {
      console.warn(
        "[Auth] token blacklisted:",
        trimmedToken.slice(0, 10) + "..."
      );
      res.status(401).json({
        success: false,
        status: 401,
        message: "Token sudah logout",
      });
      return;
    }

    // 2) decode & verify
    const decoded = verifyToken(trimmedToken) as AuthenticatedUser;

    if (!decoded || !decoded.id) {
      console.warn("[Auth] verifyToken returned falsy:", decoded);
      res
        .status(401)
        .json({ success: false, status: 401, message: "Token tidak valid" });
      return;
    }

    // 3) cek apakah token masih aktif (tersimpan di Redis)
    const activeToken = await redis.get(`token:${decoded.id}`);
    if (!activeToken) {
      console.warn("[Auth] no active token for user:", decoded.id);
      res.status(401).json({
        success: false,
        status: 401,
        message: "Token tidak aktif lagi. Silakan login ulang.",
      });
      return;
    }

    if (
      typeof activeToken !== "string" ||
      activeToken.trim() !== trimmedToken
    ) {
      console.warn("[Auth] token mismatch for user:", decoded.id);
      res.status(401).json({
        success: false,
        status: 401,
        message: "Token tidak aktif lagi. Silakan login ulang.",
      });
      return;
    }

    // 4) cek role validitas
    if (!decoded.role || !Object.values(Role).includes(decoded.role)) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Role tidak valid",
      });
      return;
    }

    // 5) sukses
    req.user = decoded;
    next();
    return;
  } catch (err: any) {
    console.error("[Auth] verify error:", err?.message || err);
    res.status(401).json({
      success: false,
      status: 401,
      message: "Token tidak valid",
    });
    return;
  }
};
