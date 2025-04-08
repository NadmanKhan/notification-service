import { RequestHandler } from "express";

import logger from "../config/logger";
import { z } from "zod";
import { NotificationValidationError } from "../schemas/error";

export const validateRequestBody = (schema: z.ZodTypeAny): RequestHandler => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (err) {
            if (err instanceof z.ZodError) {
                logger.error("💥 Validation error:\n" + err.errors);
                const errorMessage = `Validation error: ${err.toString()}`;
                const statusCode = 422; // Unprocessable Entity
                next(new NotificationValidationError(errorMessage, statusCode));
            } else {
                next(err);
            }
        }
    };
};
