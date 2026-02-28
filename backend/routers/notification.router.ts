import { Router } from "express";
import {
    getNotifications,
    markOneRead,
    markAllRead,
    archiveOne,
    deleteOne,
    createNotification,
} from "../controller/notification.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// All notification routes require authentication
router.use(isAuthenticated);

router.get("/", getNotifications);
router.patch("/mark-all-read", markAllRead);
router.patch("/:id/read", markOneRead);
router.patch("/:id/archive", archiveOne);
router.delete("/:id", deleteOne);

// Admin can create notifications via HTTP (other roles get them programmatically)
router.post("/", authorize("admin"), createNotification);

export default router;
