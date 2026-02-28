import { Schema, model } from "mongoose";
import type { IAcademicSession } from "../types/index.ts";

const academicSessionSchema = new Schema<IAcademicSession>(
    {
        startYear: { type: Number, required: true },
        endYear: { type: Number, required: true },

        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        institute: {
            type: Schema.Types.ObjectId,
            ref: "Institute",
            required: true,
        },

        // Single source of truth for all students in this cohort
        currentSemester: { type: Number, default: 1, min: 1, max: 8 },

        status: {
            type: String,
            enum: ["upcoming", "active", "locked", "completed"],
            default: "upcoming",
        },

        intakeCapacity: { type: Number, default: 60 },
        totalEnrolledStudents: { type: Number, default: 0 },

        // Once closed, intake capacity cannot be changed without unlock
        enrollmentOpen: { type: Boolean, default: true },

        // Next automated or manual promotion eligibility date
        nextPromotionDate: { type: Date, required: true },

        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true },
);

// One session per department per intake year
academicSessionSchema.index({ department: 1, startYear: 1 }, { unique: true });

// Fast queries scoped by dept + institute
academicSessionSchema.index({ department: 1, institute: 1 });
academicSessionSchema.index({ status: 1, nextPromotionDate: 1 }); // used by cron job

const AcademicSessionModel = model<IAcademicSession>(
    "AcademicSession",
    academicSessionSchema,
);
export default AcademicSessionModel;
