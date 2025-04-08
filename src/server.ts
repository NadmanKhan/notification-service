import notificationServiceRouter from "./routes/notification";
import config from "./config";
import logger from "./config/logger";
import { uncaughtErrorHandler, notFoundHandler } from "./middleware/error-handlers";
import { requestLogger, errorLogger, responseLogger } from "./middleware/loggers";

import express from "express";

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(notificationServiceRouter);
app.use(uncaughtErrorHandler);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(responseLogger);

app.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port}`);
});
