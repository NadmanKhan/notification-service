import type { LogLevel } from "../utils/logger";
import { Logger } from "../utils/logger";
import config from "./";

const logLevel: LogLevel = 'info'; // Default log level

const logger = new Logger({
    logFile: config.logger.logFile,
    logLevel,
});

export default logger;
