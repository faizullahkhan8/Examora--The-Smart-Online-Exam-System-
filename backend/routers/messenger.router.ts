import { Router } from "express";
import {
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
    deleteConversation,
    searchUsers,
} from "../controller/messenger.controller.ts";
import { isAuthenticated } from "../middlewares/auth.middleware.ts";

const router = Router();

// All messenger routes require authentication
router.use(isAuthenticated);

// Conversations
router.get("/conversations", getConversations);
router.post("/conversations", createConversation);
router.delete("/conversations/:id", deleteConversation);

// Messages within a conversation
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);

// User search (for starting new conversations)
router.get("/users/search", searchUsers);

export default router;
