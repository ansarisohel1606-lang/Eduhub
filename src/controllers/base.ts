import { Request, Response } from "express";
import { safeData } from "../utils/safeData";
import AppError from "../errors/AppError";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const protectedFields = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "createdBy",
  "updatedBy",
  "deletedAt",
  "isDeleted",
  "password",
  "refreshTokenHash",
  "deliveryOtpHash",
  "rawResponse",
]);

export abstract class BaseController {
  constructor(
    protected model: any,
    protected resourceName: string,
    private readonly writableFields?: string[],
  ) {}

  protected blocked(req: AuthenticatedRequest) {
    return (
      req.user?.role === "student" ||
      req.user?.role === "teacher" ||
      req.user?.role === "admin"
    );
  }

  protected id(req: Request) {
    const id = Number(req.params.id);

    return Number.isInteger(id) && id > 0
      ? id
      : null;
  }

  protected payload(body: Record<string, any>) {
    const modelFields = Object.keys(
      this.model.rawAttributes || {},
    );

    const allowed = new Set(
      this.writableFields ||
        modelFields.filter(
          (field) => !protectedFields.has(field),
        ),
    );

    return Object.entries(body || {}).reduce<
      Record<string, any>
    >((result, [field, value]) => {
      /*
       * Check writable fields
       */
      if (
        !allowed.has(field) ||
        protectedFields.has(field)
      ) {
        throw new AppError(
          `Field is not writable: ${field}`,
          400,
        );
      }

      const attribute: any =
        this.model.rawAttributes?.[field];

      const type = String(
        attribute?.type?.key ||
          attribute?.type?.constructor?.key ||
          "",
      ).toUpperCase();

      /*
       * NULL validation
       */
      if (value === null) {
        if (attribute?.allowNull === false) {
          throw new AppError(
            `${field} cannot be null`,
            400,
          );
        }

        result[field] = value;
        return result;
      }

      /*
       * Number validation
       */
      const invalidNumber =
        [
          "INTEGER",
          "BIGINT",
          "FLOAT",
          "DOUBLE",
          "DECIMAL",
          "REAL",
        ].includes(type) &&
        (typeof value !== "number" ||
          !Number.isFinite(value));

      /*
       * Integer validation
       */
      const invalidInteger =
        ["INTEGER", "BIGINT"].includes(type) &&
        !Number.isInteger(value);

      /*
       * Boolean validation
       */
      const invalidBoolean =
        type === "BOOLEAN" &&
        typeof value !== "boolean";

      /*
       * String validation
       */
      const invalidString =
        ["STRING", "TEXT", "CHAR", "UUID"].includes(
          type,
        ) &&
        typeof value !== "string";

      /*
       * Date validation
       */
      const invalidDate =
        type === "DATE" &&
        (typeof value !== "string" ||
          Number.isNaN(Date.parse(value)));

      /*
       * Array validation
       */
      const invalidArray =
        type === "ARRAY" &&
        !Array.isArray(value);

      /*
       * JSON / JSONB validation
       */
      const invalidJson =
        ["JSON", "JSONB"].includes(type) &&
        (typeof value !== "object" ||
          Array.isArray(value));

      if (
        invalidNumber ||
        invalidInteger ||
        invalidBoolean ||
        invalidString ||
        invalidDate ||
        invalidArray ||
        invalidJson
      ) {
        throw new AppError(
          `Invalid value for ${field}`,
          400,
        );
      }

      /*
       * ENUM validation
       */
      if (
        attribute?.values &&
        !attribute.values.includes(value)
      ) {
        throw new AppError(
          `Invalid value for ${field}`,
          400,
        );
      }

      result[field] = value;

      return result;
    }, {});
  }

  protected failure(
    res: Response,
    err: any,
  ) {
    const status =
      err instanceof AppError
        ? err.statusCode
        : err?.name ===
              "SequelizeValidationError" ||
            err?.name ===
              "SequelizeForeignKeyConstraintError"
          ? 400
          : 500;

    return res.status(status).json({
      success: false,
      error: {
        code:
          err.code ||
          (status === 400
            ? "VALIDATION_ERROR"
            : "INTERNAL_ERROR"),

        message:
          status === 500
            ? "Request could not be completed"
            : err.message,
      },
    });
  }

  protected async findById(
    id: number,
    where: any = {},
  ) {
    if (
      typeof this.model.findById ===
      "function"
    ) {
      return this.model.findById(id, {
        where,
      });
    }

    return this.model.findOne({
      where: {
        ...where,
        id,
      },
    });
  }

  protected async softDelete(
    id: number,
    opts: any = {},
  ) {
    if (
      typeof this.model.softDeleteById ===
      "function"
    ) {
      return this.model.softDeleteById(
        id,
        opts,
      );
    }

    const row = await this.findById(id, {
      isDeleted: false,
    });

    if (!row) {
      return null;
    }

    await row.update({
      isDeleted: true,
      deletedAt: new Date(),
    });

    return row;
  }

  async create(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      if (this.blocked(req)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const payload = this.payload(req.body);

      if (!Object.keys(payload).length) {
        return res.status(400).json({
          success: false,
          message:
            "No writable fields supplied",
        });
      }

      const data = await this.model.create(
        payload,
        {
          user: req.user,
        },
      );

      return res.status(201).json({
        success: true,
        message: `${this.resourceName} created successfully`,
        data: safeData(data),
      });
    } catch (err: any) {
      return this.failure(res, err);
    }
  }

  async getAll(
    req: Request,
    res: Response,
  ) {
    try {
      const page = Math.max(
        Number(req.query.page) || 1,
        1,
      );

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 20,
          1,
        ),
        100,
      );

      const offset = (page - 1) * limit;

      const where = {
        isDeleted: false,
      };

      if (
        typeof this.model.paginate ===
        "function"
      ) {
        const result =
          await this.model.paginate({
            where,
            page,
            limit,
          });

        return res.status(200).json({
          success: true,
          ...safeData(result),
        });
      }

      const result =
        await this.model.findAndCountAll({
          where,
          limit,
          offset,
        });

      const totalPages = Math.ceil(
        result.count / limit,
      );

      return res.status(200).json({
        success: true,

        data: safeData(result.rows),

        pagination: {
          total: result.count,
          page,
          limit,
          totalPages,
          hasNextPage:
            page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (err: any) {
      return this.failure(res, err);
    }
  }

  async getOne(
    req: Request,
    res: Response,
  ) {
    try {
      const id = this.id(req);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Invalid id",
        });
      }

      const data = await this.findById(
        id,
        {
          isDeleted: false,
        },
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: `${this.resourceName} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: safeData(data),
      });
    } catch (err: any) {
      return this.failure(res, err);
    }
  }

  async update(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      if (this.blocked(req)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const id = this.id(req);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Invalid id",
        });
      }

      const payload = this.payload(req.body);

      if (!Object.keys(payload).length) {
        return res.status(400).json({
          success: false,
          message:
            "No writable fields supplied",
        });
      }

      const row = await this.findById(
        id,
        {
          isDeleted: false,
        },
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `${this.resourceName} not found`,
        });
      }

      const data =
        typeof this.model.updateById ===
        "function"
          ? await this.model.updateById(
              id,
              payload,
              {
                user: req.user,
              },
            )
          : await row.update(payload);

      return res.status(200).json({
        success: true,
        message: `${this.resourceName} updated successfully`,
        data: safeData(data),
      });
    } catch (err: any) {
      return this.failure(res, err);
    }
  }

  async delete(
    req: AuthenticatedRequest,
    res: Response,
  ) {
    try {
      if (this.blocked(req)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const id = this.id(req);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Invalid id",
        });
      }

      const row = await this.softDelete(
        id,
        {
          user: req.user,
        },
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `${this.resourceName} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: `${this.resourceName} deleted successfully`,
      });
    } catch (err: any) {
      return this.failure(res, err);
    }
  }
}