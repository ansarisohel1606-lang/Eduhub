import { Router } from "express";
import studentController from "../controllers/student.controller";
import authMiddleware from "../middlewares/auth.middleware";
import authorizeRoles from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/dashboard",
  authMiddleware,
  authorizeRoles("student"),
  studentController.getDashboard
);

export default router;
