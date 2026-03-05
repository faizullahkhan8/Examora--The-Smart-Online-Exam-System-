import mongoose from "mongoose";
import type { IAuditLog } from "../types/index.ts";

const auditLogSchema = new mongoose.Schema<IAuditLog>(
    {
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        actorLabel: {
            type: String,
            default: "Anonymous",
            trim: true,
        },
        actorRole: {
            type: String,
            default: "unknown",
            trim: true,
        },
        eventType: {
            type: String,
            required: true,
            trim: true,
        },
        resource: {
            type: String,
            required: true,
            trim: true,
        },
        method: {
            type: String,
            required: true,
            trim: true,
        },
        path: {
            type: String,
            required: true,
            trim: true,
        },
        targetId: {
            type: String,
            default: "",
            trim: true,
        },
        targetLabel: {
            type: String,
            default: "",
            trim: true,
        },
        statusCode: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Success", "Failed"],
            required: true,
        },
        severity: {
            type: String,
            enum: ["Info", "Warning", "Critical"],
            required: true,
        },
        ip: {
            type: String,
            default: "",
            trim: true,
        },
        userAgent: {
            type: String,
            default: "",
            trim: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1, status: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, method: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ eventType: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
