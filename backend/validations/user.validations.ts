import * as z from "zod";

export const createUserValidation = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "principal", "hod", "teacher", "student"]),
    institute: z.string().optional(),
    department: z.string().optional(),
});

export const updateUserValidation = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z
        .enum(["admin", "principal", "hod", "teacher", "student"])
        .optional(),
    institute: z.string().optional(),
    department: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const resetPasswordValidation = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
