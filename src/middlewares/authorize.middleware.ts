import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";

export const authorize = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: Akses ditolak" });
    }
    next();
  };
};
