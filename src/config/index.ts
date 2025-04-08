import type { NotificationType } from "../schemas/notification";

import dotenv from "dotenv";

dotenv.config();

// Note
// ----
// For the sake of consistency, provider indices are 0-based in this codebase despite being 1-based in 
// the provider URLs or environment variables. Remember to adjust them accordingly.

const config = {
    providers: {
        smsNotifiers: [0, 1, 2].map(index => {
            const port = parseInt(process.env[`PORT_SMS_${index + 1}`] || "8070") + index + 1;
            return { url: `http://127.0.0.1:${port}/api/sms/provider${index + 1}` };
        }),
        emailNotifiers: [0, 1, 2].map(index => {
            const port = parseInt(process.env[`PORT_EMAIL_${index + 1}`] || "8090") + index + 1;
            return { url: `http://127.0.0.1:${port}/api/email/provider${index + 1}` };
        }),
    },
    server: {
        port: parseInt(process.env.PORT || "3010")
    },
    logger: {
        logLevel: process.env.LOG_LEVEL || "info",
        logFile: {
            path: process.env.LOG_FILE_PATH || "logs/notification-service.log",
            clearOnStartup: process.env.LOG_FILE_CLEAR_ON_STARTUP?.toLowerCase() === "true",
        },
    },
} as const;

export default config;
