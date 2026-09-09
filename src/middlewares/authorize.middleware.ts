import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

type UserRole = "student" | "teacher" | "admin";

const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    // authMiddleware should run before this middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

export default authorizeRoles;
