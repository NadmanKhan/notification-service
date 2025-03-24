import express from "express";
import notificationRoutes from "./routes/notification";
import config from "./config";

const app = express();
app.use(express.json());
app.use(notificationRoutes);

app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
});
