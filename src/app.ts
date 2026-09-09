import express from "express";
import authRoutes from "./routes/auth.routes";
import AppError from "./utils/AppError";
import adminRoutes from "./routes/admin.routes";
import teacherRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/student.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "EduHub API is running",
  });
});

app.use("/user", authRoutes);

app.use("/admin", adminRoutes);
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);

//End
app.use(AppError.handle);

export default app;