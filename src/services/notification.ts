import type { Notification, NotificationType } from "../schemas/notification";

import { notifiers } from "../config/providers";
import logger from "../config/logger";
import { ExponentialBackoff } from "../utils/backoff";
import { NotificationSendError } from "../schemas/error";
import { foldAttempts } from "../utils/retry";

import axios from "axios";

// * ------------
// * Global state
// * ------------

const roundRobin = {
    notifierIndex: { sms: 0, email: 0 },
};

// * ----------------
// * Helper functions
// * ----------------

function getNextNotifierIndex(type: NotificationType) {
    const index = roundRobin.notifierIndex[type];
    roundRobin.notifierIndex[type] = (index + 1) % notifiers[type].length;
    return index;
}

function makeNumbered(count: number, word: string) {
    return `${count} ${word}${count > 1 ? "s" : ""}`;
}

// * ----------------
// * Public functions
// * ----------------

export async function sendNotification(notification: Notification) {
    const availableNotifiers = notifiers[notification.type];
    if (!availableNotifiers) {
        throw new NotificationSendError(`No notifiers found for notification type: ${notification.type}`);
    }

    const backoff = new ExponentialBackoff({
        firstDelayTime: 500,
        delayTimeMultiplier: 1.5,
        maxRetryCount: 10,
        maxJitter: 0.5,
    });
    let attemptCount = 0;

    // Main operation that sends the notification
    const attempt = async (notifierIndex: number) => {
        attemptCount += 1;
        const notifier = availableNotifiers[notifierIndex];
                
        logger.info(`🚀 Attempt #${attemptCount}: Sending ${notification.type} via provider #${notifierIndex}...`);
        const result = await notifier.notify(notification);
        logger.info(`✅ Successfully sent ${notification.type} after ${makeNumbered(attemptCount, "attempt")}!`);

        return result;
    };

    // Error callback that retries the notification send operation
    const retry = async (prevNotifierIndex: number, previousError: Error) => {
        logger.info(`❗ Error while sending notification via provider #${prevNotifierIndex}: ${JSON.stringify(previousError)}`);

        if (backoff.done) {
            logger.info(`❌ Failed to send ${notification.type} after ${makeNumbered(attemptCount, "attempt")}; exiting...`);
            throw new NotificationSendError(`Failed to send ${notification.type}; please try again later`);
        }

        if (attemptCount % availableNotifiers.length === 0) {
            logger.info(`✋ All providers exhausted; waiting for ${backoff.delayTime} ms before retrying...`);
            await backoff.delayNext();
        }

        const nextNotifierIndex = (prevNotifierIndex + 1) % availableNotifiers.length;
        logger.info(`🔄 Retrying ${notification.type} via provider #${nextNotifierIndex}`);

        return nextNotifierIndex;
    };

    return foldAttempts(attempt, retry, getNextNotifierIndex(notification.type));
}
