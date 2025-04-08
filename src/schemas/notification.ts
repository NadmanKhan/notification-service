import { z } from "zod";

export const smsSchema = z.object({
    phone: z.string()
        .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, {
            message: "Invalid phone number",
        }),
    text: z.string()
        .min(1, {
            message: "Text is required",
        })
});

export const emailSchema = z.object({
    subject: z.string()
        .min(1, {
            message: "Subject is required",
        }),
    body: z.string()
        .min(1, {
            message: "Body is required",
        }),
    recipients: z.array(
        z.string()
            .email({
                message: "Invalid email address"
            })
    )
        .nonempty({
            message: "At least one recipient is required",
        }),
});

export const notificationSchema = z.union([
    z.object({
        type: z.literal("sms"),
        data: smsSchema,
    }),
    z.object({
        type: z.literal("email"),
        data: emailSchema,
    }),
]);

export type Sms = z.infer<typeof smsSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = Notification["type"];
