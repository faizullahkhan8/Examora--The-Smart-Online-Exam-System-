import { z } from "zod";

export const createConversationValidation = z.object({
    type: z.enum(["direct", "group", "announcement"]),
    name: z.string().min(1).optional(),
    participants: z
        .array(z.string().min(1))
        .min(1, "At least one participant is required"),
});

export const sendMessageValidation = z.object({
    text: z.string().min(1, "Message cannot be empty").max(4000),
});
