import notificationRoutes from "./routes/notification";
import config from "./config";
import logger from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middleware";

import express from "express";

const app = express();
app.use(express.json());
app.use(notificationRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port}`);
});
