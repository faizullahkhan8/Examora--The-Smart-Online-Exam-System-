import * as z from "zod";

export const loginValidation = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerValidation = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "principal", "hod", "teacher", "student"]),
    department: z.string().optional(),
    institute: z.string().optional(),
});
