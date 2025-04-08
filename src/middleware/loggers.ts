import { RequestHandler, ErrorRequestHandler } from "express";
import logger from "../config/logger";

export const requestLogger: RequestHandler = (req, _res, next) => {
  const { method, url } = req;
  const logMessage = `Request: ${method} ${url}`;
  logger.debug(logMessage, { messageColorRule: { fg: 'FgBlue' } });
  next();
};

export const errorLogger: ErrorRequestHandler = (err: Error, _req, _res, next) => {
  const logMessage = `💥 Error: ${err.message}`;
  logger.error(logMessage, { messageColorRule: { fg: 'FgRed' } });
  logger.error(err.stack || "No stack trace available");
  next(err);
};

export const responseLogger: RequestHandler = (_req, res, next) => {
  const { statusCode } = res;
  const logMessage = `Response status: ${statusCode}`;  
  logger.debug(logMessage, { messageColorRule: { fg: 'FgGreen' } });
  next();
};
