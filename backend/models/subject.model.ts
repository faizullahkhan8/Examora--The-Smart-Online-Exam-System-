import { Schema, model } from "mongoose";
import type { ISubject } from "../types/index.ts";

const subjectSchema = new Schema<ISubject>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: "AcademicSession",
            required: true,
        },
        semester: { type: Number, required: true, min: 1, max: 8 },
        teacher: { type: Schema.Types.ObjectId, ref: "User" },
        creditHours: { type: Number, default: 3 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

// Unique code per department per session
subjectSchema.index({ code: 1, department: 1, session: 1 }, { unique: true });
subjectSchema.index({ department: 1, semester: 1 });
subjectSchema.index({ teacher: 1 });

const SubjectModel = model<ISubject>("Subject", subjectSchema);
export default SubjectModel;
