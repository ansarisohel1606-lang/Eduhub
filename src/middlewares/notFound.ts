import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404
    )
  );
};

export default notFound;