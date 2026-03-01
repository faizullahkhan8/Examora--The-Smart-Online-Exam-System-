import { Router } from "express";
import {
    getHODProfile,
    getDashboardStats,
    getFacultyList,
    createFaculty,
    toggleFacultyStatus,
} from "../controller/hod.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// All HOD routes require authentication + hod role
router.use(isAuthenticated, authorize("hod"));

// Profile & Dashboard
router.get("/profile", getHODProfile);
router.get("/dashboard", getDashboardStats);

// Faculty management (dept-scoped)
router.get("/faculty", getFacultyList);
router.post("/faculty", createFaculty);
router.patch("/faculty/:id/toggle", toggleFacultyStatus);

export default router;
