import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";

import ConversationModel from "../models/conversation.model.ts";
import MessageModel from "../models/message.model.ts";
import UserModel from "../models/user.model.ts";

import {
    createConversationValidation,
    sendMessageValidation,
} from "../validations/messenger.validations.ts";

// Helper to build a lean participant object for populating
const PARTICIPANT_FIELDS = "firstName lastName email role institute isActive";

// ─── GET CONVERSATIONS ────────────────────────────────────────────────────────
export const getConversations = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.session.user?.id;

            const conversations = await ConversationModel.find({
                participants: userId,
                isActive: true,
            })
                .populate("participants", PARTICIPANT_FIELDS)
                .populate({
                    path: "lastMessage",
                    populate: { path: "sender", select: "firstName lastName" },
                })
                .populate("createdBy", "firstName lastName role")
                .sort({ updatedAt: -1 });

            res.status(200).json({ success: true, data: conversations });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CREATE CONVERSATION ──────────────────────────────────────────────────────
export const createConversation = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = createConversationValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const { type, name, participants } = validation.data;
            const creatorId = req.session.user?.id;

            // Only admin can create announcements
            if (type === "announcement" && req.session.user?.role !== "admin") {
                return next(
                    new ErrorResponse(
                        "Only admins can create announcements",
                        403,
                    ),
                );
            }

            // For direct messages, ensure no duplicate conversation exists
            if (type === "direct") {
                if (participants.length !== 1) {
                    return next(
                        new ErrorResponse(
                            "Direct conversations must have exactly one recipient",
                            400,
                        ),
                    );
                }
                const existingConversation = await ConversationModel.findOne({
                    type: "direct",
                    isActive: true,
                    participants: {
                        $all: [creatorId, participants[0]],
                        $size: 2,
                    },
                })
                    .populate("participants", PARTICIPANT_FIELDS)
                    .populate({
                        path: "lastMessage",
                        populate: {
                            path: "sender",
                            select: "firstName lastName",
                        },
                    });

                if (existingConversation) {
                    return res.status(200).json({
                        success: true,
                        data: existingConversation,
                        message: "Existing conversation returned",
                    });
                }
            }

            // Validate all participant IDs exist
            const participantIds = [
                ...new Set([String(creatorId), ...participants]),
            ];
            const usersExist = await UserModel.countDocuments({
                _id: { $in: participantIds },
            });
            if (usersExist !== participantIds.length) {
                return next(
                    new ErrorResponse(
                        "One or more participants not found",
                        404,
                    ),
                );
            }

            const conversation = await ConversationModel.create({
                type,
                name,
                participants: participantIds,
                createdBy: creatorId,
            });

            const populated = await ConversationModel.findById(conversation._id)
                .populate("participants", PARTICIPANT_FIELDS)
                .populate("createdBy", "firstName lastName role");

            res.status(201).json({
                success: true,
                message: "Conversation created",
                data: populated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── GET MESSAGES ─────────────────────────────────────────────────────────────
export const getMessages = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid conversation ID", 400));
            }

            // Confirm the user is a participant
            const conversation = await ConversationModel.findOne({
                _id: id,
                participants: userId,
                isActive: true,
            });
            if (!conversation) {
                return next(new ErrorResponse("Conversation not found", 404));
            }

            const page = parseInt((req.query.page as string) || "1");
            const limit = parseInt((req.query.limit as string) || "50");
            const skip = (page - 1) * limit;

            const [messages, total] = await Promise.all([
                MessageModel.find({ conversation: id })
                    .populate("sender", "firstName lastName role institute")
                    .sort({ createdAt: 1 })
                    .skip(skip)
                    .limit(limit),
                MessageModel.countDocuments({ conversation: id }),
            ]);

            // Mark all messages as read by this user
            await MessageModel.updateMany(
                {
                    conversation: id,
                    readBy: {
                        $ne: new mongoose.Types.ObjectId(String(userId)),
                    },
                },
                { $addToSet: { readBy: userId } },
            );

            res.status(200).json({
                success: true,
                data: messages,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── SEND MESSAGE ─────────────────────────────────────────────────────────────
export const sendMessage = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid conversation ID", 400));
            }

            const validation = sendMessageValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            // Confirm the user is a participant
            const conversation = await ConversationModel.findOne({
                _id: id,
                participants: userId,
                isActive: true,
            });
            if (!conversation) {
                return next(new ErrorResponse("Conversation not found", 404));
            }

            const message = await MessageModel.create({
                conversation: id,
                sender: userId,
                text: validation.data.text,
                readBy: [userId],
            });

            // Update lastMessage pointer and updatedAt on the conversation
            await ConversationModel.findByIdAndUpdate(id, {
                lastMessage: message._id,
                updatedAt: new Date(),
            });

            const populated = await MessageModel.findById(message._id).populate(
                "sender",
                "firstName lastName role institute",
            );

            res.status(201).json({
                success: true,
                message: "Message sent",
                data: populated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE CONVERSATION ──────────────────────────────────────────────────────
export const deleteConversation = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid conversation ID", 400));
            }

            const conversation = await ConversationModel.findOne({
                _id: id,
                participants: userId,
                isActive: true,
            });
            if (!conversation) {
                return next(new ErrorResponse("Conversation not found", 404));
            }

            // Soft-delete: only creator or admin can hard-delete; others just leave
            if (
                String(conversation.createdBy) === String(userId) ||
                req.session.user?.role === "admin"
            ) {
                conversation.isActive = false;
                await conversation.save();
            } else {
                // Just remove this user from participants
                conversation.participants = conversation.participants.filter(
                    (p) => String(p) !== String(userId),
                ) as any;
                await conversation.save();
            }

            res.status(200).json({
                success: true,
                message: "Conversation deleted",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── SEARCH USERS (for starting a conversation) ───────────────────────────────
export const searchUsers = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { q = "" } = req.query as { q?: string };
            const userId = req.session.user?.id;

            const filter: Record<string, any> = {
                _id: { $ne: userId },
                isActive: true,
            };

            if (q) {
                filter.$or = [
                    { firstName: { $regex: q, $options: "i" } },
                    { lastName: { $regex: q, $options: "i" } },
                    { email: { $regex: q, $options: "i" } },
                ];
            }

            const users = await UserModel.find(filter)
                .select("firstName lastName email role institute isActive")
                .populate("institute", "name logoInitials")
                .limit(20);

            res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
