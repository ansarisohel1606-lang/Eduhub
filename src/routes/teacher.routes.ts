import { Router } from "express";
import teacherController from "../controllers/teacher.controller";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("teacher", "admin"),
  teacherController.getDashboard
);

export default router;