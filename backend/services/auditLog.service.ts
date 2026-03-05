import type { Request } from "express";
import type { Types } from "mongoose";
import AuditLogModel from "../models/auditLog.model.ts";

export type AuditStatus = "Success" | "Failed";
export type AuditSeverity = "Info" | "Warning" | "Critical";

export interface CreateAuditLogInput {
    actorId?: string | Types.ObjectId | null;
    actorLabel?: string;
    actorRole?: string;
    eventType: string;
    resource: string;
    method: string;
    path: string;
    targetId?: string;
    targetLabel?: string;
    statusCode: number;
    status?: AuditStatus;
    severity?: AuditSeverity;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
    "password",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
]);

const toTitleCase = (value: string) =>
    value
        .replace(/[-_]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

export const deriveStatus = (statusCode: number): AuditStatus =>
    statusCode >= 400 ? "Failed" : "Success";

export const deriveSeverity = (statusCode: number): AuditSeverity => {
    if (statusCode >= 500) return "Critical";
    if (statusCode >= 400) return "Warning";
    return "Info";
};

export const extractClientIp = (req: Request): string => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0]?.trim() || req.ip || "";
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return forwarded[0]?.trim() || req.ip || "";
    }
    return req.ip || "";
};

export const sanitizeForAudit = (
    value: unknown,
    depth = 0,
): unknown => {
    if (depth > 3) return "[Truncated]";
    if (value === null || value === undefined) return value;

    if (typeof value === "string") {
        return value.length > 400 ? `${value.slice(0, 400)}...` : value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.slice(0, 20).map((item) => sanitizeForAudit(item, depth + 1));
    }

    if (typeof value === "object") {
        const objectValue = value as Record<string, unknown>;
        const sanitized: Record<string, unknown> = {};

        for (const [key, nestedValue] of Object.entries(objectValue)) {
            if (SENSITIVE_KEYS.has(key)) {
                sanitized[key] = "[REDACTED]";
            } else {
                sanitized[key] = sanitizeForAudit(nestedValue, depth + 1);
            }
        }

        return sanitized;
    }

    return "[Unsupported]";
};

export const inferEventType = (
    method: string,
    path: string,
    resource: string,
): string => {
    const normalizedPath = path.toLowerCase();

    if (normalizedPath === "/api/auth/login") {
        return "User Login";
    }
    if (normalizedPath === "/api/auth/logout") {
        return "User Logout";
    }
    if (normalizedPath === "/api/auth/register") {
        return "User Registration";
    }
    if (normalizedPath.includes("/toggle-status")) {
        return `Toggle ${toTitleCase(resource)} Status`;
    }
    if (normalizedPath.includes("/assign-principal")) {
        return "Assign Principal";
    }
    if (normalizedPath.includes("/reset-password")) {
        return "Reset Password";
    }
    if (normalizedPath.endsWith("/submit")) {
        return `Submit ${toTitleCase(resource)}`;
    }
    if (normalizedPath.endsWith("/review")) {
        return `Review ${toTitleCase(resource)}`;
    }
    if (normalizedPath.endsWith("/promote")) {
        return `Promote ${toTitleCase(resource)}`;
    }

    switch (method.toUpperCase()) {
        case "POST":
            return `Create ${toTitleCase(resource)}`;
        case "PUT":
            return `Update ${toTitleCase(resource)}`;
        case "PATCH":
            return `Modify ${toTitleCase(resource)}`;
        case "DELETE":
            return `Delete ${toTitleCase(resource)}`;
        default:
            return `Read ${toTitleCase(resource)}`;
    }
};

export const createAuditLog = async (payload: CreateAuditLogInput) => {
    try {
        const status = payload.status ?? deriveStatus(payload.statusCode);
        const severity = payload.severity ?? deriveSeverity(payload.statusCode);

        await AuditLogModel.create({
            actorId: payload.actorId ?? null,
            actorLabel: payload.actorLabel || "Anonymous",
            actorRole: payload.actorRole || "unknown",
            eventType: payload.eventType,
            resource: payload.resource,
            method: payload.method,
            path: payload.path,
            targetId: payload.targetId || "",
            targetLabel: payload.targetLabel || "",
            statusCode: payload.statusCode,
            status,
            severity,
            ip: payload.ip || "",
            userAgent: payload.userAgent || "",
            metadata: payload.metadata ?? {},
        });
    } catch (error) {
        console.error("[AuditLog] Failed to persist audit log:", error);
    }
};
