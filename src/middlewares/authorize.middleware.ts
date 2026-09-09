import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import AppError from "../errors/AppError";

type UserRole = "student" | "teacher" | "admin";

const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    // authMiddleware should run before this middleware
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError("Access denied", 403);
    }

    next();
  };
};

export default authorizeRoles;
