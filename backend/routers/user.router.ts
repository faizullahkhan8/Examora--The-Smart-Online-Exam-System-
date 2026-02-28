import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    adminResetPassword,
} from "../controller/user.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// All user-management routes require an authenticated admin session
router.use(isAuthenticated, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/toggle-status", toggleUserStatus);
router.patch("/:id/reset-password", adminResetPassword);

export default router;
