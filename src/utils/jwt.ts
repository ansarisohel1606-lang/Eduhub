import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  name: string;
  role: "student" | "teacher" | "admin";
}

const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "30d",
  });
};

export default generateToken;

