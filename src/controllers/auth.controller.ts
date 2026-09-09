import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import User from "../models/User";
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

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
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
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
