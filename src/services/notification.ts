import config from "../config";
import { ExponentialBackoff } from "../utils/backoff";
import { foldAttempts } from "../utils/retry";
import logger from "../utils/logger";

import axios from "axios";

// * -----
// * Types
// * -----

export type Sms = {
    phone: string;
    text: string;
};

export type Email = {
    subject: string;
    body: string;
    recipients: string[];
};

export type NotificationType = "sms" | "email";

export type Notification = {
    type: "sms";
    data: Sms;
} | {
    type: "email";
    data: Email;
};

export class NotificationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotificationError";
    }
}

export class NotificationValidationError extends NotificationError {
    constructor(message: string) {
        super(message);
        this.name = "NotificationValidationError";
    }
}

export class NotificationSendError extends NotificationError {
    constructor(message: string) {
        super(message);
        this.name = "NotificationSendError";
    }
}

// * ------------
// * Global state
// * ------------

const roundRobin = {
    providerIndex: { sms: 0, email: 0 },
};

// * ----------------
// * Helper functions
// * ----------------

function getNextProviderIndex(type: NotificationType) {
    const index = roundRobin.providerIndex[type];
    roundRobin.providerIndex[type] = (index + 1) % config.providers[type].length;
    return index;
}

function validateSms(sms: any) {
    if (!sms || typeof sms !== "object") {
        throw new NotificationValidationError("Invalid or missing SMS data");
    }

    const { phone, text } = sms;

    const bangladeshiPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!phone || !bangladeshiPhoneRegex.test(phone)) {
        throw new NotificationValidationError("Invalid or missing phone number");
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
        throw new NotificationValidationError("Invalid or missing text");
    }
}

function validateEmail(email: any) {
    if (!email || typeof email !== "object") {
        throw new NotificationValidationError("Invalid or missing email data");
    }

    const { subject, body, recipients } = email;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
        throw new NotificationValidationError("Invalid or missing subject");
    }

    if (!body || typeof body !== "string" || body.trim().length === 0) {
        throw new NotificationValidationError("Invalid or missing body");
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
        throw new NotificationValidationError("Invalid or missing recipients list");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of recipients) {
        if (!emailRegex.test(email)) {
            throw new NotificationValidationError(`Invalid email in recipients: ${email}`);
        }
    }
}

function makeProviderUrl(type: NotificationType, index: number) {
    return `http://127.0.0.1:${config.providers[type][index].port}/api/${type}/provider${index + 1}`;
}

function makeNumbered(count: number, word: string) {
    return `${count} ${word}${count > 1 ? "s" : ""}`;
}

// * ----------------
// * Public functions
// * ----------------

export function validateNotification(notification: any) {
    if (!notification || typeof notification !== "object") {
        throw new NotificationValidationError("Invalid or missing notification data");
    }

    const { type, data } = notification;

    if (type === "sms") {
        validateSms(data);
    } else if (type === "email") {
        validateEmail(data);
    } else {
        throw new NotificationValidationError("Invalid or missing notification type");
    }
}

export async function sendNotification(notification: Notification) {
    const providers = config.providers[notification.type];
    const backoff = new ExponentialBackoff({
        firstDelayTime: 500,
        delayTimeMultiplier: 1.5,
        maxRetryCount: 10,
        maxJitter: 0.5,
    });
    let attemptCount = 0;

    // Main operation that sends the notification
    const attempt = async (providerIndex: number) => {
        attemptCount += 1;
        const url = makeProviderUrl(notification.type, providerIndex);

        logger.info(`🚀 Attempt #${attemptCount}: Sending ${notification.type} via ${url}...`);
        const response = await axios.post(url, notification.data);
        logger.info(`✅ Successfully sent ${notification.type} after ${makeNumbered(attemptCount, "attempt")}!`);

        return response.data;
    };

    // Error callback that retries the notification send operation
    const retry = async (previousProviderIndex: number, previousError: Error) => {
        logger.info(`❗ Error while sending notification: ${JSON.stringify(previousError)}`);
        
        if (backoff.done) {
            logger.info(`❌ Failed to send ${notification.type} after ${makeNumbered(attemptCount, "attempt")}; exiting...`);
            throw new NotificationSendError(`Failed to send ${notification.type}; please try again later`);
        }

        if (attemptCount % providers.length === 0) {
            logger.info(`✋ All providers exhausted; waiting for ${backoff.delayTime} ms before retrying...`);
            await backoff.delay();
        }

        const nextProviderIndex = (previousProviderIndex + 1) % providers.length;
        logger.info(`🔄 Retrying ${notification.type} via ${makeProviderUrl(notification.type, nextProviderIndex)}`);

        return nextProviderIndex;
    };

    return foldAttempts(attempt, retry, getNextProviderIndex(notification.type));
}
