import { Router } from "express";
import {
    getSessionsByDepartment,
    getSessionById,
    createSession,
    updateSession,
    lockSession,
    unlockSession,
    closeEnrollment,
    manualPromote,
    getSessionAnalytics,
} from "../controller/academicSession.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// ─── Analytics (institute-wide, no deptId needed) ────────────────────────────
router.get(
    "/analytics",
    isAuthenticated,
    authorize("principal", "admin"),
    getSessionAnalytics,
);

// ─── Department-scoped routes ─────────────────────────────────────────────────
router.get("/:deptId", isAuthenticated, getSessionsByDepartment);
router.get("/:deptId/:id", isAuthenticated, getSessionById);

router.post(
    "/:deptId",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    createSession,
);
router.put(
    "/:deptId/:id",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    updateSession,
);

router.patch(
    "/:deptId/:id/lock",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    lockSession,
);
router.patch(
    "/:deptId/:id/unlock",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    unlockSession,
);
router.patch(
    "/:deptId/:id/close-enrollment",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    closeEnrollment,
);

// Only HOD can manually promote a session's semester
router.patch(
    "/:deptId/:id/promote",
    isAuthenticated,
    authorize("hod"),
    manualPromote,
);

export default router;
