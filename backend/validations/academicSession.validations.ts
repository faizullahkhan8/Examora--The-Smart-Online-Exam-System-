import * as z from "zod";

export const createSessionValidation = z.object({
    startYear: z
        .number({ required_error: "Start year is required" })
        .min(2000)
        .max(2100),
    intakeCapacity: z.number().min(1).max(2000).optional().default(60),
});

export const updateSessionValidation = z.object({
    intakeCapacity: z.number().min(1).max(2000).optional(),
    // Status can only be changed via dedicated endpoints (lock / close-enrollment)
});

export const manualPromoteValidation = z.object({
    reason: z.string().min(1, "Promotion reason is required").max(500),
});
