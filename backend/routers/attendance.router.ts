import { Router } from "express";
import {
    markAttendance,
    getAttendanceBySubject,
    getMyAttendance,
} from "../controller/attendance.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/", isAuthenticated, authorize("teacher"), markAttendance);
router.get(
    "/subject/:subjectId",
    isAuthenticated,
    authorize("teacher", "hod", "principal"),
    getAttendanceBySubject,
);
router.get(
    "/my/:subjectId",
    isAuthenticated,
    authorize("student"),
    getMyAttendance,
);

export default router;
