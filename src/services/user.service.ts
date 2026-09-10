import { Op } from "sequelize";
import User from "../models/User";
import AppError from "../errors/AppError";

type UserRole = "student" | "teacher" | "admin";

interface GetAllUsersInput {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
}

interface UpdateUserInput {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
}

/**
 * GET ALL USERS
 */
const getAllUsers = async ({
    page,
    limit,
    search,
    role,
    isActive,
}: GetAllUsersInput) => {

    const offset = (page - 1) * limit;

    const where: any = {};

    // Search by name or email
    if (search) {
        where[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${search}%`,
                },
            },
            {
                email: {
                    [Op.iLike]: `%${search}%`,
                },
            },
        ];
    }

    // Filter by role
    if (role) {
        where.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    const { rows, count } = await User.findAndCountAll({
        where,

        // Never return password
        attributes: {
            exclude: ["password"],
        },

        order: [["id", "ASC"]],

        limit,
        offset,
    });

    return {
        users: rows,

        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    };
};

/**
 * GET USER BY ID
 */
const getUserById = async (id: number) => {

    const user = await User.findByPk(id, {
        attributes: {
            exclude: ["password"],
        },
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
};

/**
 * UPDATE USER
 */
const updateUser = async (
    id: number,
    data: UpdateUserInput
) => {

    const user = await User.findByPk(id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    /**
     * Fields allowed to update
     */
    const allowedFields = [
        "name",
        "email",
        "role",
        "isActive",
    ];

    /**
     * Get fields sent by client
     */
    const providedFields = Object.keys(data);

    /**
     * Check invalid fields
     */
    const invalidFields = providedFields.filter(
        (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        throw new AppError(
            `Invalid fields: ${invalidFields.join(", ")}`,
            400
        );
    }

    /**
     * PATCH request cannot be empty
     */
    if (providedFields.length === 0) {
        throw new AppError(
            "At least one field is required",
            400
        );
    }

    /**
     * Validate name
     */
    if (data.name !== undefined) {

        if (!data.name.trim()) {
            throw new AppError(
                "Name cannot be empty",
                400
            );
        }
    }

    /**
     * Validate email
     */
    if (data.email !== undefined) {

        if (!data.email.trim()) {
            throw new AppError(
                "Email cannot be empty",
                400
            );
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const normalizedEmail =
            data.email.trim().toLowerCase();

        if (!emailRegex.test(normalizedEmail)) {
            throw new AppError(
                "Invalid email format",
                400
            );
        }

        /**
         * Check whether another user
         * already has this email
         */
        const existingUser = await User.findOne({
            where: {
                email: normalizedEmail,

                id: {
                    [Op.ne]: id,
                },
            },
        });

        if (existingUser) {
            throw new AppError(
                "Email already registered",
                409
            );
        }

        data.email = normalizedEmail;
    }

    /**
     * Validate role
     */
    if (data.role !== undefined) {

        const validRoles: UserRole[] = [
            "student",
            "teacher",
            "admin",
        ];

        if (!validRoles.includes(data.role)) {
            throw new AppError(
                "Invalid role",
                400
            );
        }
    }

    /**
     * Update only provided fields
     */
    await user.update({
        ...(data.name !== undefined && {
            name: data.name.trim(),
        }),

        ...(data.email !== undefined && {
            email: data.email,
        }),

        ...(data.role !== undefined && {
            role: data.role,
        }),

        ...(data.isActive !== undefined && {
            isActive: data.isActive,
        }),
    });

    /**
     * Return safe user data
     */
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

/**
 * DELETE USER
 *
 * Soft delete:
 * Instead of actually deleting the row,
 * we deactivate the user.
 */
const deleteUser = async (id: number) => {

    const user = await User.findByPk(id);

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    await user.update({
        isActive: false,
    });

    return {
        id: user.id,
        isActive: user.isActive,
    };
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};