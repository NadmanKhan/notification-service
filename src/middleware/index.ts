import logger from "../utils/logger";

import { ErrorRequestHandler, RequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    logger.error("An error occurred:\n" + err.stack);
    res.status(500).send("Something broke!");
};

export const notFoundHandler: RequestHandler = (req, res) => {
    logger.debug(`Not found: ${req.url}`);
    res.status(404).send("Not found");
}