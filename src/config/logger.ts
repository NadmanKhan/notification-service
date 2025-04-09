import type { LogLevel } from "../utils/logger";
import { Logger } from "../utils/logger";
import config from "./";

const logger = new Logger({
    logFile: config.logger.logFile,
    logLevel: config.logger.logLevel as LogLevel,
});

export default logger;
