import express from "express";
import authRoutes from "./routes/auth.routes";
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";
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

// 404 middleware must come AFTER routes
app.use(notFound);

// Global error handler MUST be last
app.use(errorHandler);

export default app;