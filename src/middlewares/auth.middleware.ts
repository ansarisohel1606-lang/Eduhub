import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";

interface AuthTokenPayload {
  userId: number;
  role: "student" | "teacher" | "admin";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header not found", 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Invalid authorization header format", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Token not found", 401);
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError("JWT_SECRET is not configured", 500);
    }

    const decoded = jwt.verify(
      token,
      secret
    ) as AuthTokenPayload;

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    throw new AppError("An unexpected error occurred", 500);
  }
};

export default authMiddleware;
