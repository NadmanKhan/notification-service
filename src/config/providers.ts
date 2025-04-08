import { createNotifier } from "../utils/notifier";
import config from ".";

import axios from "axios";

const smsNotifier1 = createNotifier<{ message: string }>(
    'sms',
    async (notification) => {
        const response = await axios.post(config.providers.smsNotifiers[0].url, notification.data);
        return response.data;
    },
);

const smsNotifier2 = createNotifier<{ message: string }>(
    'sms',
    async (notification) => {
        const response = await axios.post(config.providers.smsNotifiers[1].url, notification.data);
        return response.data;
    },
);

const smsNotifier3 = createNotifier<{ message: string }>(
    'sms',
    async (notification) => {
        const response = await axios.post(config.providers.smsNotifiers[2].url, notification.data);
        return response.data;
    },
);

const emailNotifier1 = createNotifier<{ message: string }>(
    'email',
    async (notification) => {
        const response = await axios.post(config.providers.emailNotifiers[0].url, notification.data);
        return response.data;
    },
);

const emailNotifier2 = createNotifier<{ message: string }>(
    'email',
    async (notification) => {
        const response = await axios.post(config.providers.emailNotifiers[1].url, notification.data);
        return response.data;
    },
);

const emailNotifier3 = createNotifier<{ message: string }>(
    'email',
    async (notification) => {
        const response = await axios.post(config.providers.emailNotifiers[2].url, notification.data);
        return response.data;
    },
);

export const notifiers = {
    sms: [smsNotifier1, smsNotifier2, smsNotifier3],
    email: [emailNotifier1, emailNotifier2, emailNotifier3],
};

