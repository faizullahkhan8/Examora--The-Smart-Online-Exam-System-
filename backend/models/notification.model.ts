import mongoose from "mongoose";
import type { INotification } from "../types/index.ts";

const notificationSchema = new mongoose.Schema<INotification>(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["security", "user", "system", "institute"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "low",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

// Index for fast per-user queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model<INotification>(
    "Notification",
    notificationSchema,
);
