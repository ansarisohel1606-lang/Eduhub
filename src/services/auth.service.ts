import bcrypt from "bcrypt";
import User from "../models/User";
import AppError from "../errors/AppError";
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

    // Validate name
    if (!name || !name.trim()) {
        throw new AppError("Name is required", 400);
    }

    // Validate email
    if (!email || !email.trim()) {
        throw new AppError("Email is required", 400);
    }

    // Validate password
    if (!password) {
        throw new AppError("Password is required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        throw new AppError("Invalid email format", 400);
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        throw new AppError("Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",
        isActive: true,
    });

    // Generate JWT
    const accessToken = generateToken({
        userId: user.id,
        name: user.name,
        role: user.role,
    });

    // Return safe user data
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

    // Validate email
    if (!email || !email.trim()) {
        throw new AppError("Email is required", 400);
    }

    // Validate password
    if (!password) {
        throw new AppError("Password is required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        throw new AppError("Invalid email format", 400);
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
        where: {
            email: normalizedEmail,
        },
    });

    // Generic authentication error
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    // Check inactive user
    if (!user.isActive) {
        throw new AppError("Invalid email or password", 401);
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT
    const accessToken = generateToken({
        userId: user.id,
        name: user.name,
        role: user.role,
    });

    // Return safe user data
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
