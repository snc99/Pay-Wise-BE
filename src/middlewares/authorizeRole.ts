import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const authorizeRole = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({
          message: "Akses ditolak, hanya Super Admin yang dapat mengakses",
        });
      return;
    }

    next();
  };
};
