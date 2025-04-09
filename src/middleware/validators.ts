import type { RequestHandler } from "express";

import logger from "../config/logger";
import { z } from "zod";
import { NotificationValidationError } from "../schemas/error";

// ze = Zod + Express
namespace ze {
    export type RequestParams = z.ZodRecord<z.ZodString, z.ZodString>;
    export type RequestBody = z.ZodTypeAny;
    export type RequestHeaders = z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>;
    export type RequestQuery = z.ZodLazy<
        z.ZodRecord<
            z.ZodString,
            z.ZodOptional<
                z.ZodUnion<[
                    z.ZodString,
                    z.ZodLazy<RequestQuery>,
                    z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodLazy<RequestQuery>]>>
                ]>
            >
        >
    >;
    export type Request = {
        params?: RequestParams;
        body?: RequestBody;
        headers?: RequestHeaders;
        query?: RequestQuery;
    };
}

export const validateRequest = ({ params, body, headers, query }: ze.Request): RequestHandler => {
    return async (req, _res, next) => {
        try {
            const resultPromises: Promise<any>[] = [];
            if (params) {
                resultPromises.push(params.parseAsync(req.params));
            }
            if (body) {
                resultPromises.push(body.parseAsync(req.body));
            }
            if (headers) {
                resultPromises.push(headers.parseAsync(req.headers));
            }
            if (query) {
                resultPromises.push(query.parseAsync(req.query));
            }
            await Promise.all(resultPromises);
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
