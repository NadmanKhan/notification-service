import axios from "axios";
import config from "../config";
import { ExponentialBackoff } from "../utils/backoff";
import { foldRetries } from "../utils/retry";

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

const roundRobin: {
    state: Record<NotificationType, number>,
    nextProviderIndex: (type: NotificationType) => number,
} = {
    state: { sms: 0, email: 0 },
    nextProviderIndex(type: NotificationType) {
        const index = roundRobin.state[type];
        roundRobin.state[type] = (index + 1) % config.providers[type].length;
        return index;
    }
};

function makeProviderUrl(type: NotificationType, index: number) {
    return `http://127.0.0.1:${config.providers[type][index].port}/api/${type}/provider${index + 1}`;
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

    const worker = async (providerIndex: number) => {
        const url = makeProviderUrl(notification.type, providerIndex);
        attemptCount += 1;
        console.log(new Date(), `🎬 Attempt #${attemptCount}: Sending ${notification.type} via ${url}...`);
        const response = await axios.post<{ message: string }>(url, notification.data);
        return response.data;
    };

    const retry = async (previousProviderIndex: number, fail: () => void): Promise<number | void> => {
        if (backoff.done) {
            console.error(new Date(), `❌ Failed to send ${notification.type} after ${attemptCount} attempt${attemptCount > 1 ? "s" : ""}; exiting...`);
            fail();
            return;
        }

        console.error(new Date(), `❗ Failed; retrying ${notification.type}...`);

        if (attemptCount % providers.length === 0) {
            await backoff.delay();
        }

        return (previousProviderIndex + 1) % providers.length;
    };

    const result = await foldRetries(worker, retry, roundRobin.nextProviderIndex(notification.type));
    console.log(new Date(), `✅ Successfully sent ${notification.type} after ${attemptCount} attempt${attemptCount > 1 ? "s" : ""}!`);
    return result;
}
