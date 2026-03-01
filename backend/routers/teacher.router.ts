import { Router } from "express";
import {
    getTeacherProfile,
    getTeacherDashboard,
    getMySubjects,
    getSubjectById,
    getSubjectStudents,
} from "../controller/teacher.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

router.use(isAuthenticated, authorize("teacher"));

router.get("/profile", getTeacherProfile);
router.get("/dashboard", getTeacherDashboard);
router.get("/subjects", getMySubjects);
router.get("/subjects/:id", getSubjectById);
router.get("/subjects/:id/students", getSubjectStudents);

export default router;
