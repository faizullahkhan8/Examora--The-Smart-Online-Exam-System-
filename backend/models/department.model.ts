import mongoose from "mongoose";
import type { IDepartment } from "../types/index.ts";

const departmentSchema = new mongoose.Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        description: {
            type: String,
            trim: true,
        },
        institute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institute",
            required: true,
        },
        hod: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        capacity: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true },
);

// Unique department code within an institute
departmentSchema.index({ institute: 1, code: 1 }, { unique: true });

export default mongoose.model<IDepartment>("Department", departmentSchema);
