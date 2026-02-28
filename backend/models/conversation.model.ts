import mongoose from "mongoose";
import type { IConversation } from "../types/index.ts";

const conversationSchema = new mongoose.Schema<IConversation>(
    {
        type: {
            type: String,
            enum: ["direct", "group", "announcement"],
            required: true,
        },
        name: {
            type: String,
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<IConversation>(
    "Conversation",
    conversationSchema,
);
