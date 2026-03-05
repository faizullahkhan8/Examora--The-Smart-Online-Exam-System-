import type { NextFunction, Request, Response } from "express";
import {
    createAuditLog,
    extractClientIp,
    inferEventType,
    sanitizeForAudit,
} from "../services/auditLog.service.ts";

const shouldSkipAudit = (req: Request): boolean => {
    const path = req.originalUrl.split("?")[0];
    if (req.method === "OPTIONS") return true;
    if (path === "/") return true;
    if (path.startsWith("/api/audit-logs")) return true;
    return false;
};

const pickTargetId = (req: Request): string => {
    const params = req.params as Record<string, string | undefined>;
    return (
        params.id ||
        params.deptId ||
        params.subjectId ||
        params.conversationId ||
        params.messageId ||
        ""
    );
};

const pickTargetLabel = (req: Request): string => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const candidates: Array<unknown> = [
        body.name,
        body.title,
        body.email,
        body.subjectId,
        body.recipient,
    ];
    const target = candidates.find((v) => typeof v === "string" && v.trim());
    return typeof target === "string" ? target.trim() : "";
};

const getActorLabel = (req: Request): string => {
    const sessionUser = req.session?.user;
    if (sessionUser?.id && sessionUser.role) {
        const id = String(sessionUser.id);
        return `${sessionUser.role.toUpperCase()}#${id.slice(-6)}`;
    }

    const email = (req.body as Record<string, unknown> | undefined)?.email;
    if (typeof email === "string" && email.trim()) return email.trim();

    return "Anonymous";
};

export const auditLogMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (shouldSkipAudit(req)) {
        return next();
    }

    const startedAt = Date.now();
    const requestPath = req.originalUrl.split("?")[0];
    const resource = requestPath.split("/").filter(Boolean)[1] || "system";

    const initialActorId = req.session?.user?.id
        ? String(req.session.user.id)
        : null;
    const initialActorRole = req.session?.user?.role || "unknown";
    const initialActorLabel = getActorLabel(req);

    const safeRequestBody = sanitizeForAudit(req.body);
    const safeRequestParams = sanitizeForAudit(req.params);
    const safeRequestQuery = sanitizeForAudit(req.query);

    res.on("finish", () => {
        const resolvedActorId = req.session?.user?.id
            ? String(req.session.user.id)
            : initialActorId;
        const resolvedActorRole = req.session?.user?.role || initialActorRole;
        const currentActorLabel = getActorLabel(req);
        const resolvedActorLabel =
            currentActorLabel === "Anonymous" ? initialActorLabel : currentActorLabel;

        void createAuditLog({
            actorId: resolvedActorId,
            actorLabel: resolvedActorLabel,
            actorRole: resolvedActorRole,
            eventType: inferEventType(req.method, requestPath, resource),
            resource,
            method: req.method,
            path: requestPath,
            targetId: pickTargetId(req),
            targetLabel: pickTargetLabel(req),
            statusCode: res.statusCode,
            ip: extractClientIp(req),
            userAgent: req.get("user-agent") || "",
            metadata: {
                durationMs: Date.now() - startedAt,
                params: safeRequestParams,
                query: safeRequestQuery,
                body: safeRequestBody,
            },
        });
    });

    next();
};
