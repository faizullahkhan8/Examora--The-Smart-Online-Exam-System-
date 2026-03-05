import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ErrorResponse } from "../middlewares/error.handler.ts";
import AuditLogModel from "../models/auditLog.model.ts";

export const getAuditLogs = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                search = "",
                severity = "",
                status = "",
                resource = "",
                method = "",
                dateFrom = "",
                dateTo = "",
                page = "1",
                limit = "20",
            } = req.query as Record<string, string>;

            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
            const skip = (pageNum - 1) * limitNum;

            const filter: Record<string, unknown> = {};

            if (severity) filter.severity = severity;
            if (status) filter.status = status;
            if (resource) filter.resource = resource;
            if (method) filter.method = method.toUpperCase();

            if (dateFrom || dateTo) {
                const createdAt: Record<string, Date> = {};
                if (dateFrom) createdAt.$gte = new Date(dateFrom);
                if (dateTo) {
                    const endDate = new Date(dateTo);
                    endDate.setHours(23, 59, 59, 999);
                    createdAt.$lte = endDate;
                }
                filter.createdAt = createdAt;
            }

            if (search) {
                const regex = { $regex: search, $options: "i" };
                filter.$or = [
                    { eventType: regex },
                    { actorLabel: regex },
                    { actorRole: regex },
                    { targetLabel: regex },
                    { targetId: regex },
                    { ip: regex },
                    { path: regex },
                ];
            }

            const [logs, total, statsAgg] = await Promise.all([
                AuditLogModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                AuditLogModel.countDocuments(filter),
                AuditLogModel.aggregate([
                    { $match: filter },
                    {
                        $facet: {
                            totals: [{ $count: "total" }],
                            bySeverity: [
                                { $group: { _id: "$severity", count: { $sum: 1 } } },
                            ],
                            byStatus: [
                                { $group: { _id: "$status", count: { $sum: 1 } } },
                            ],
                            securityAlerts: [
                                {
                                    $match: {
                                        $or: [
                                            { severity: "Critical" },
                                            { severity: "Warning" },
                                        ],
                                    },
                                },
                                { $count: "count" },
                            ],
                            roleChanges: [
                                {
                                    $match: {
                                        eventType: {
                                            $regex:
                                                "Role|Assign Principal|Reset Password|Toggle User Status",
                                            $options: "i",
                                        },
                                    },
                                },
                                { $count: "count" },
                            ],
                            failedLogins: [
                                {
                                    $match: {
                                        path: "/api/auth/login",
                                        status: "Failed",
                                    },
                                },
                                { $count: "count" },
                            ],
                        },
                    },
                ]),
            ]);

            const parsed = statsAgg[0] ?? {};
            const bySeverity: Record<string, number> = {};
            const byStatus: Record<string, number> = {};

            for (const item of parsed.bySeverity ?? []) {
                bySeverity[item._id] = item.count;
            }
            for (const item of parsed.byStatus ?? []) {
                byStatus[item._id] = item.count;
            }

            res.status(200).json({
                success: true,
                data: logs,
                stats: {
                    totalEvents: parsed.totals?.[0]?.total ?? 0,
                    securityAlerts: parsed.securityAlerts?.[0]?.count ?? 0,
                    roleChanges: parsed.roleChanges?.[0]?.count ?? 0,
                    failedLogins: parsed.failedLogins?.[0]?.count ?? 0,
                    bySeverity,
                    byStatus,
                },
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

export const getAuditLogById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const log = await AuditLogModel.findById(req.params.id).lean();
            if (!log) {
                return next(new ErrorResponse("Audit log not found", 404));
            }
            res.status(200).json({ success: true, data: log });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
