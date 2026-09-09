import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate";
import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation";
import authController from "../controllers/auth.controller";

const router = Router();

router.post("/register",
     validate(registerSchema),
     authController.register);

router.get("/profile",
     authMiddleware,
     authController.getProfile);

router.post("/login",
     validate(loginSchema),
      authController.login);

export default router;
