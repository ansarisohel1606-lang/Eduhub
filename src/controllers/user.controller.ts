import { Request, Response } from "express";
import { BaseController } from "./base";
import User from "../models/User";
import userService from "../services/user.service";
import AppError from "../errors/AppError";
import { safeData } from "../utils/safeData";

class UserController extends BaseController {
  constructor() {
    super(
      User,
      "User",
      ["name", "email", "role", "isActive"],
    );
  }

  // GET /api/v1/users
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);

      const limit = Math.min(
        Math.max(Number(req.query.limit) || 20, 1),
        100,
      );

      const search =
        typeof req.query.search === "string"
          ? req.query.search
          : undefined;

      const role =
        typeof req.query.role === "string"
          ? req.query.role as "student" | "teacher" | "admin"
          : undefined;

      let isActive: boolean | undefined;

      if (req.query.isActive === "true") {
        isActive = true;
      }

      if (req.query.isActive === "false") {
        isActive = false;
      }

      const result = await userService.getAllUsers({
        page,
        limit,
        search,
        role,
        isActive,
      });

      return res.status(200).json({
        success: true,
        data: safeData(result.users),
        pagination: result.pagination,
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }

  // GET /api/v1/users/:id
  async getUserById(req: Request, res: Response) {
    try {
      const id = this.id(req);

      if (!id) {
        throw new AppError("Invalid user id", 400);
      }

      const user = await userService.getUserById(id);

      return res.status(200).json({
        success: true,
        data: safeData(user),
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }

  // PATCH /api/v1/users/:id
  async updateUser(req: Request, res: Response) {
    try {
      const id = this.id(req);

      if (!id) {
        throw new AppError("Invalid user id", 400);
      }

      // BaseController validates writable fields
      const payload = this.payload(req.body);

      if (!Object.keys(payload).length) {
        throw new AppError("No writable fields supplied", 400);
      }

      // Controller converts req → service arguments
      const user = await userService.updateUser(id, payload);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: safeData(user),
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }

  // DELETE /api/v1/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const id = this.id(req);

      if (!id) {
        throw new AppError("Invalid user id", 400);
      }

      const result = await userService.deleteUser(id);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: result,
      });
    } catch (error: any) {
      return this.failure(res, error);
    }
  }
}

const userController = new UserController();

export default {
  getAllUsers: userController.getAllUsers.bind(userController),
  getUserById: userController.getUserById.bind(userController),
  updateUser: userController.updateUser.bind(userController),
  deleteUser: userController.deleteUser.bind(userController),
};