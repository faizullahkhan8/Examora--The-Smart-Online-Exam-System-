import { z } from "zod";

export const createNotificationValidation = z.object({
    recipient: z.string().min(1, "Recipient is required"),
    type: z.enum(["security", "user", "system", "institute"]),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    priority: z.enum(["low", "medium", "high"]).default("low"),
});
