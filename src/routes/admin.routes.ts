import { Router } from "express";
import adminController from "../controllers/admin.controller";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  adminController.getDashboard
);

export default router;
