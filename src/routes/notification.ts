import type { Notification } from "../services/notification";
import { validateNotification, sendNotification } from "../services/notification";
import logger from "../utils/logger";

import { Router } from "express";

const router = Router();

router.post("/notification",
    (req, res, next) => {
        try {
            validateNotification(req.body);
            next();
        } catch (error) {
            logger.error(`💥 ${error.message}`);
            res.status(400).json({ success: false, error: error.message });
        }
    },
    async (req, res) => {
        try {
            const notification = req.body as Notification;
            const response = await sendNotification(notification);
            res.status(200).json({ success: true, response });
        } catch (error) {
            logger.error(`💥 ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

export default router;
