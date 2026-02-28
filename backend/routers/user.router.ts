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

// ─── Principal-accessible: read users (e.g. list HODs for their institute) ───
router.get("/", isAuthenticated, authorize("principal", "admin"), getAllUsers);
router.get(
    "/:id",
    isAuthenticated,
    authorize("principal", "admin"),
    getUserById,
);

// ─── Admin-only mutations ─────────────────────────────────────────────────────
router.post("/", isAuthenticated, authorize("admin"), createUser);
router.put("/:id", isAuthenticated, authorize("admin"), updateUser);
router.delete("/:id", isAuthenticated, authorize("admin"), deleteUser);
router.patch(
    "/:id/toggle-status",
    isAuthenticated,
    authorize("admin"),
    toggleUserStatus,
);
router.patch(
    "/:id/reset-password",
    isAuthenticated,
    authorize("admin"),
    adminResetPassword,
);

export default router;
