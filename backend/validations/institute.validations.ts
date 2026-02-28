import * as z from "zod";

const locationSchema = z.object({
    address: z.string().min(3, "Address must be at least 3 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
});

export const createInstituteValidation = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    domain: z.string().min(3, "Domain must be at least 3 characters"),
    location: locationSchema,
    contactPhone: z.string().optional(),
    contactEmail: z.string().email("Invalid contact email").optional(),
    website: z.string().url("Invalid website URL").optional(),
    type: z.enum(["university", "college", "school", "polytechnic"]),
    establishedYear: z
        .number()
        .int()
        .min(1800)
        .max(new Date().getFullYear())
        .optional(),
    logoInitials: z
        .string()
        .min(1)
        .max(3, "Logo initials must be 1–3 characters"),
    principal: z.string().optional(),
});

export const updateInstituteValidation = createInstituteValidation.partial();

export const assignPrincipalValidation = z.object({
    principalId: z.string().min(1, "Principal ID is required"),
});
