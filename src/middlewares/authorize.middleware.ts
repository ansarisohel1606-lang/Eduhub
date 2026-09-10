import { Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import {
  AuthenticatedRequest,
  UserRole,
} from "./auth.middleware";

const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    // authMiddleware should run before this middleware
    if (!req.user) {
      throw new AppError(
        "User not authenticated",
        401,
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "Access denied",
        403,
      );
    }

    next();
  };
};

export default authorizeRoles;