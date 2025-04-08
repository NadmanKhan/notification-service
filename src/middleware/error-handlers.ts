import { ServerError, ClientError } from "../schemas/error";

import { ErrorRequestHandler, RequestHandler } from "express";

export const uncaughtErrorHandler: ErrorRequestHandler = (err: Error, _req, res, next) => {
    if (err instanceof ServerError) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    } else if (err instanceof ClientError) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    } else {
        res.status(500).json({ success: false, error: "Internal server error" });
    }
    next();
};

export const notFoundHandler: RequestHandler = (_req, res, next) => {
    if (!res.writableFinished) {
        res.status(404).send("Not found");
    }
    next();
};