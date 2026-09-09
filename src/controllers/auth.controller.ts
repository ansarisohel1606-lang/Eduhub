import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import User from "../models/User";
import AppError from "../errors/AppError";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({
      email,
      password,
    });

    if(!result) {
      return next(new AppError("Invalid email or password", 401));  
    }
  } catch (error) {
    next(error);
  }
};

const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
     throw new AppError("User not authenticated", 401);
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getProfile,
};
