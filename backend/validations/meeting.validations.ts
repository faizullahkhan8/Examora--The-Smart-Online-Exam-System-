import { z } from "zod";

export const createMeetingValidation = z.object({
    title:           z.string().min(2, "Title is required"),
    description:     z.string().optional().default(""),
    date:            z.string().min(1, "Date is required"),
    startTime:       z.string().min(1, "Start time is required"),
    endTime:         z.string().min(1, "End time is required"),
    locationType:    z.enum(["physical", "online"]),
    location:        z.string().optional().default(""),
    meetingLink:     z.string().optional().default(""),
    status:          z.enum(["draft", "scheduled"]).default("draft"),
    participantMode: z.enum(["bulk", "individual", "single"]).default("individual"),
    bulkGroup: z.object({
        type:         z.enum(["all_faculty","all_students","all_staff","department","semester","course","role"]),
        department:   z.string().optional(),
        semester:     z.number().optional(),
        course:       z.string().optional(),
        role:         z.string().optional(),
        /** Generic sub-value (dept ID, session ID, class name, role key) */
        subValue:     z.string().optional(),
        /** For semester-wise: the scoped department ID */
        departmentId: z.string().optional(),
    }).optional(),
    participants: z.array(z.string()).optional().default([]), // user IDs for individual mode
    // single-mode participant stored as a free-text entry handled in controller
    singleParticipant: z.object({
        name:       z.string(),
        role:       z.string(),
        department: z.string().optional(),
        semester:   z.string().optional(),
    }).optional(),
});

export const updateMeetingValidation = z.object({
    title:        z.string().min(2).optional(),
    description:  z.string().optional(),
    date:         z.string().optional(),
    startTime:    z.string().optional(),
    endTime:      z.string().optional(),
    locationType: z.enum(["physical", "online"]).optional(),
    location:     z.string().optional(),
    meetingLink:  z.string().optional(),
    notes:        z.string().optional(),
});

export const updateStatusValidation = z.object({
    status: z.enum(["draft", "scheduled", "cancelled", "completed"]),
});

export const addParticipantsValidation = z.object({
    participants: z.array(z.string()).min(1),
});

export const acknowledgeValidation = z.object({
    acknowledgement:       z.enum(["attending", "not_attending"]),
    acknowledgementReason: z.string().optional().default(""),
});

export const markAttendanceValidation = z.object({
    // Array of { userId, status } for bulk; or single entry
    attendance: z.array(
        z.object({
            userId: z.string(),
            status: z.enum(["present", "absent", "excused"]),
        }),
    ).min(1),
});
