import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import authService from "../services/auth.service";
import User from "../models/User";
import AppError from "../errors/AppError";
import { BaseController } from "./base";

class AuthController extends BaseController {
  constructor() {
    super(User, "User");
  }

  async register(
    req: Request,
    res: Response,
  ) {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      const user =
        await authService.registerUser({
          name,
          email,
          password,
        });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(
    req: Request,
    res: Response,
  ) {
    try {
      const {
        email,
        password,
      } = req.body;

      const result =
        await authService.loginUser({
          email,
          password,
        });

      if (!result) {
        throw new AppError(
          "Invalid email or password",
          401,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }

  /**
   * GET /api/v1/auth/profile
   */
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      if (!req.user) {
        throw new AppError(
          "User not authenticated",
          401,
        );
      }

      const user = await this.findById(
        req.user.userId,
      );

      if (!user) {
        throw new AppError(
          "User not found",
          404,
        );
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }
}

const authController =
  new AuthController();

export default {
  register:
    authController.register.bind(
      authController,
    ),

  login:
    authController.login.bind(
      authController,
    ),

  getProfile:
    authController.getProfile.bind(
      authController,
    ),
};
