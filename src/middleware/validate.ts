import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/errorHandler.js";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const issues = result.error.issues.map((err : any) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        // @ts-ignore
        throw new ApiError(`Validation failed`, 400, 'validation_error', issues);
      }

      // replace req.body with parsed data (properly typed & sanitized)
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
