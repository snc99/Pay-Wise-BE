import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token tidak ditemukan" });
    return;
  }

  try {
    const decoded = verifyToken(token) as AuthenticatedUser;

    // Pastikan decoded.role adalah salah satu dari enum Role
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
