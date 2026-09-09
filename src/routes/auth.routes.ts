import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", authController.register);
router.get("/profile", authMiddleware, authController.getProfile);

router.post("/login", authController.login);

export default router;
