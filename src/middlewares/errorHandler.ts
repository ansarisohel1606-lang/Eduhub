import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  ValidationError,
  UniqueConstraintError,
} from "sequelize";
import AppError from "../errors/AppError";

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation error
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Custom application error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Sequelize validation error
  if (err instanceof ValidationError) {
    const errors = err.errors.map((error) => ({
      field: error.path || "unknown",
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Duplicate database value
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "Email already exists",
    });
  }

  // Unknown/unexpected error
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorHandler;