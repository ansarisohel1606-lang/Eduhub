import { Router } from "express";

import userController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  userController.getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.getUserById
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  userController.deleteUser
);

export default router;