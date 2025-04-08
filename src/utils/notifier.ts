import type { Notification, NotificationType } from "../schemas/notification";

export type Notifier<Result> = {
    type: NotificationType;
    notify: (notification: Notification) => Promise<Result>;
};

export function createNotifier<Result>(
    type: NotificationType,
    notify: (notification: Notification) => Promise<Result>,
): Notifier<Result> {
    return {
        type,
        notify,
    };
}