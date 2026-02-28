import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    adminResetPassword,
    createHOD,
} from "../controller/user.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// ─── Principal-accessible: create HOD account scoped to their institute ───────
router.post(
    "/hod",
    isAuthenticated,
    authorize("principal", "admin"),
    createHOD,
);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.use(isAuthenticated, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/toggle-status", toggleUserStatus);
router.patch("/:id/reset-password", adminResetPassword);

export default router;
