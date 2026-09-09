import { Request, Response } from "express";

const getDashboard = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to student dashboard",
  });
};

export default {
  getDashboard,
};
