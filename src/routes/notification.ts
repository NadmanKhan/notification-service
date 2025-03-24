import { Router } from "express";
import { sendNotification } from "../services/notification";
import type { Notification } from "../services/notification";

const router = Router();

router.post("/notification", async (req, res) => {
    try {
        const notification = req.body as Notification;
        const response = await sendNotification(notification);
        res.status(200).json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
