import type { Notification } from "../schemas/notification";

import * as service from "../services/notification";
import logger from "../config/logger";
import { notificationSchema } from "../schemas/notification";
import { validateRequestBody } from "../middleware/validators";

import { Router, RequestHandler } from "express";


const sendNotification: RequestHandler = async (req: { body: Notification }, res, next) => {
    try {
        const notification = req.body;
        const result = await service.sendNotification(notification);
        res.status(200).json({ success: true, result });
        next();
    } catch (err) {
        logger.error(`💥 ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
        next(err);
    }
};

const router = Router();
router.post("/notification",
    validateRequestBody(notificationSchema),
    sendNotification,
);

export default router;
