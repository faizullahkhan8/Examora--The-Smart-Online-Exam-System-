import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";
import NotificationModel from "../models/notification.model.ts";
import { createNotificationValidation } from "../validations/notification.validations.ts";

// ─── GET NOTIFICATIONS ────────────────────────────────────────────────────────
export const getNotifications = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = String(req.session.user?.id);
            const {
                type = "",
                isRead = "",
                isArchived = "false",
                search = "",
                page = "1",
                limit = "20",
            } = req.query as Record<string, string>;

            const filter: Record<string, any> = { recipient: userId };

            if (type) filter.type = type;
            if (isRead !== "") filter.isRead = isRead === "true";
            filter.isArchived = isArchived === "true";

            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { message: { $regex: search, $options: "i" } },
                ];
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(100, parseInt(limit));
            const skip = (pageNum - 1) * limitNum;

            const [notifications, total, unreadCount] = await Promise.all([
                NotificationModel.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                NotificationModel.countDocuments(filter),
                NotificationModel.countDocuments({
                    recipient: userId,
                    isRead: false,
                    isArchived: false,
                }),
            ]);

            res.status(200).json({
                success: true,
                data: notifications,
                unreadCount,
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

// ─── MARK ONE AS READ ─────────────────────────────────────────────────────────
export const markOneRead = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = String(req.session.user?.id);

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid notification ID", 400));
            }

            const notification = await NotificationModel.findOneAndUpdate(
                { _id: id, recipient: userId },
                { $set: { isRead: true } },
                { new: true },
            );

            if (!notification) {
                return next(new ErrorResponse("Notification not found", 404));
            }

            res.status(200).json({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
export const markAllRead = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = String(req.session.user?.id);

            await NotificationModel.updateMany(
                { recipient: userId, isRead: false },
                { $set: { isRead: true } },
            );

            res.status(200).json({
                success: true,
                message: "All notifications marked as read",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── ARCHIVE ONE ──────────────────────────────────────────────────────────────
export const archiveOne = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = String(req.session.user?.id);

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid notification ID", 400));
            }

            const notification = await NotificationModel.findOneAndUpdate(
                { _id: id, recipient: userId },
                { $set: { isArchived: true, isRead: true } },
                { new: true },
            );

            if (!notification) {
                return next(new ErrorResponse("Notification not found", 404));
            }

            res.status(200).json({
                success: true,
                message: "Notification archived",
                data: notification,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE ONE ───────────────────────────────────────────────────────────────
export const deleteOne = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = String(req.session.user?.id);

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid notification ID", 400));
            }

            const notification = await NotificationModel.findOneAndDelete({
                _id: id,
                recipient: userId,
            });

            if (!notification) {
                return next(new ErrorResponse("Notification not found", 404));
            }

            res.status(200).json({
                success: true,
                message: "Notification deleted",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CREATE NOTIFICATION (admin / HTTP) ───────────────────────────────────────
export const createNotification = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = createNotificationValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const notification = await NotificationModel.create(
                validation.data,
            );

            res.status(201).json({
                success: true,
                message: "Notification created",
                data: notification,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── HELPER: push a notification programmatically ────────────────────────────
export async function pushNotification(data: {
    recipient: string;
    type: "security" | "user" | "system" | "institute";
    title: string;
    message: string;
    priority?: "low" | "medium" | "high";
}) {
    try {
        await NotificationModel.create({
            recipient: data.recipient,
            type: data.type,
            title: data.title,
            message: data.message,
            priority: data.priority ?? "low",
        });
    } catch (_) {
        // Silently fail so the main action isn't interrupted
    }
}
