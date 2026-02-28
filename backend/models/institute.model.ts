import mongoose from "mongoose";
import type { IInstituteOptions } from "../types/index.ts";

const instituteSchema = new mongoose.Schema<IInstituteOptions>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        domain: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true },
        },
        contactPhone: {
            type: String,
        },
        contactEmail: {
            type: String,
        },
        website: {
            type: String,
        },
        type: {
            type: String,
            enum: ["university", "college", "school", "polytechnic"],
            required: true,
        },
        establishedYear: {
            type: Number,
        },
        logoInitials: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        principal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        studentsCount: {
            type: Number,
            default: 0,
        },
        departmentsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<IInstituteOptions>("Institute", instituteSchema);
