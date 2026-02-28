import { z } from "zod";

export const createDepartmentValidation = z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(2).max(20),
    description: z.string().max(500).optional(),
    capacity: z.number().min(0).optional(),
});

export const updateDepartmentValidation = z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(20).optional(),
    description: z.string().max(500).optional(),
    capacity: z.number().min(0).optional(),
});

export const assignHODValidation = z.object({
    hodId: z.string().min(1, "HOD user ID is required"),
});
