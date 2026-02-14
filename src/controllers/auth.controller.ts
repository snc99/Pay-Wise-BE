// controllers/auth.controller.ts
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { redis } from "../utils/redis";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { removeToken } from "../utils/removeToken";
import { loginSchema } from "../validations/auth.schema";
import { loginService } from "../services/auth.service";

const DEFAULT_COOKIE_TTL_SECONDS = 60 * 60 * 24; // 1 day fallback

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

    const token = result.token;

    // Hitung maxAge dari token exp
    let maxAgeMs = DEFAULT_COOKIE_TTL_SECONDS * 1000;
    try {
      const decoded: any = jwt.decode(token);
      if (decoded?.exp && typeof decoded.exp === "number") {
        const nowSec = Math.floor(Date.now() / 1000);
        const ttlSec = Math.max(1, decoded.exp - nowSec);
        maxAgeMs = ttlSec * 1000;
      }
    } catch (err) {
      // ignore decode error, pakai fallback
    }

    // ✅ SET COOKIE - UPDATED
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("pw_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: maxAgeMs,
    });

    // Kembalikan response tanpa token (karena sudah di cookie)
    res.status(200).json({
      success: true,
      status: 200,
      message: "Login berhasil",
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
  next: NextFunction,
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
  next: NextFunction,
): Promise<void> => {
  try {
    const cookieToken = (req as any).cookies?.pw_token;
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader &&
      typeof authHeader === "string" &&
      authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    const token = cookieToken ?? headerToken;

    if (!token) {
      const isProd = process.env.NODE_ENV === "production";

      res.clearCookie("pw_token", {
        path: "/",
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });
      res.json({ success: true, status: 200, message: "Logged out" });
      return;
    }

    let decoded: any = null;
    try {
      decoded = jwt.decode(token) as { exp?: number; id?: string } | null;
    } catch (e) {
      decoded = null;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const ttlInSeconds =
      decoded && typeof decoded.exp === "number"
        ? Math.max(1, decoded.exp - nowInSeconds)
        : 24 * 3600;

    // Blacklist token di redis
    try {
      await redis.set(`blacklist:${token}`, "1", { ex: ttlInSeconds });
    } catch (e) {
      console.warn("[Logout] failed to set blacklist:", e);
    }

    // Hapus token aktif
    if (decoded?.id) {
      try {
        await removeToken(decoded.id);
      } catch (e) {
        console.warn("[Logout] failed to remove active token:", e);
      }
    }

    // ✅ CLEAR COOKIE - UPDATED
    res.clearCookie("pw_token", {
      path: "/",
      sameSite: "lax", // ✅ TAMBAHKAN sameSite yang sama
    });

    res.json({ success: true, status: 200, message: "Logout berhasil" });
  } catch (err) {
    next(err);
  }
};
