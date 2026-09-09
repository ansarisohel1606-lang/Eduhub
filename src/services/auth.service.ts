import bcrypt from "bcrypt";
import User from "../models/User";
import AppError from "../utils/AppError";
import generateToken from "../utils/jwt";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  if (!name || !name.trim()) {
    throw new AppError("Name is required", 400);
  }

  if (!email || !email.trim()) {
    throw new AppError("Email is required", 400);
  }

  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    throw new AppError("Invalid email format", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "student",
    isActive: true,
  });

  const accessToken = generateToken({
    userId: user.id,
    name: user.name,
    role: user.role,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    accessToken,
  };
};

const loginUser = async ({
  email,
  password,
}: LoginInput) => {
  // 1. Validate email
  if (!email || !email.trim()) {
    throw new AppError("Email is required", 400);
  }

  // 2. Validate password
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  // 3. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    throw new AppError("Invalid email format", 400);
  }

  // 4. Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 5. Find user
  const user = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  // 6. Generic authentication error
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 7. Check inactive user
  if (!user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  // 8. Compare password with bcrypt hash
  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // 9. Generate JWT
  const accessToken = generateToken({
    userId: user.id,
    name: user.name,
    role: user.role,
  });

  // 10. Return safe user data
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
};

export default {
  registerUser,
  loginUser,
};

