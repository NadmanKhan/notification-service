import dotenv from "dotenv";

dotenv.config();

// Note
// ----
// For the sake of consistency, provider indices are 0-based in this codebase despite being 1-based in 
// the provider URLs or environment variables. Remember to adjust them accordingly.

const config = {
    providers: {
        sms: [0, 1, 2].map(index => ({
            port: parseInt(process.env[`PORT_SMS_${index + 1}`] || "8070") + index + 1
        })),
        email: [0, 1, 2].map(index => ({
            port: parseInt(process.env[`PORT_EMAIL_${index + 1}`] || "8090") + index + 1
        })),
    },
    server: { port: parseInt(process.env.PORT || "3010") },
    logger: {
        paths: {
            info: process.env.INFO_LOG_FILE,
            warn: process.env.WARN_LOG_FILE,
            error: process.env.ERROR_LOG_FILE,
            debug: process.env.DEBUG_LOG_FILE,
            all: process.env.ALL_LOG_FILE,
        },
        clearLogs: process.env.CLEAR_LOGS?.toLowerCase() === "true",
    },
} as const;

export default config;
