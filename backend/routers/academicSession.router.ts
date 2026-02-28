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
    examTriggerPromote,
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
    authorize("principal", "admin"),
    createSession,
);
router.put(
    "/:deptId/:id",
    isAuthenticated,
    authorize("principal", "admin"),
    updateSession,
);

router.patch(
    "/:deptId/:id/lock",
    isAuthenticated,
    authorize("principal", "admin"),
    lockSession,
);
router.patch(
    "/:deptId/:id/unlock",
    isAuthenticated,
    authorize("principal", "admin"),
    unlockSession,
);
router.patch(
    "/:deptId/:id/close-enrollment",
    isAuthenticated,
    authorize("principal", "admin"),
    closeEnrollment,
);

// HOD, Principal, Admin can manually promote a session's semester
router.patch(
    "/:deptId/:id/promote",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    manualPromote,
);

// Internal hook: called by Exam module when all students pass final exam
// Restricted to admin (Exam module will call with admin-level auth token internally)
router.patch(
    "/:deptId/:id/exam-promote",
    isAuthenticated,
    authorize("admin"),
    examTriggerPromote,
);

export default router;
