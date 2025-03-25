import type { Notification } from "../services/notification";
import * as service from "../services/notification";
import logger from "../utils/logger";

import { Router, RequestHandler } from "express";

const validateNotification: RequestHandler = (req, res, next) => {
    try {
        service.validateNotification(req.body);
        next();
    } catch (error) {
        logger.error(`💥 ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
};

const sendNotification: RequestHandler = async (req, res) => {
    try {
        const notification = req.body as Notification;
        const result = await service.sendNotification(notification);
        res.status(200).json({ success: true, result });
    } catch (error) {
        logger.error(`💥 ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
};

const router = Router();
router.post("/notification",
    validateNotification,
    sendNotification,
);

export default router;
