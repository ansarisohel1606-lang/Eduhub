import bcrypt from "bcrypt";
import User from "../models/User";
import AppError from "../utils/AppError";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

const registerUser = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  // 1. Validate name
  if (!name || !name.trim()) {
    throw new AppError("Name is required", 400);
  }

  // 2. Validate email
  if (!email || !email.trim()) {
    throw new AppError("Email is required", 400);
  }

  // 3. Validate password
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  // 4. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    throw new AppError("Invalid email format", 400);
  }

  // 5. Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 6. Check duplicate email
  const existingUser = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // 7. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 8. Create user
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "student",
    isActive: true,
  });

  // 9. Return safe user data
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

export default {
  registerUser,
};
