// src/middlewares/errorHandler.ts
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Internal Server Error:", err);

  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002"
  ) {
    const field = (err.meta?.target as string[])[0] || "field";
    res.status(409).json({
      success: false,
      status: 409,
      message: `${field} sudah digunakan`,
      field,
    });
  }

  res.status(500).json({
    success: false,
    status: 500,
    message: "Terjadi kesalahan pada server.",
  });
};
