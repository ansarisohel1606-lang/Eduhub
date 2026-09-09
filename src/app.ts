import express from "express";
import authRoutes from "./routes/auth.routes";
import AppError from "./utils/AppError";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "EduHub API is running",
  });
});

app.use("/user", authRoutes);

app.use(AppError.handle);

export default app;