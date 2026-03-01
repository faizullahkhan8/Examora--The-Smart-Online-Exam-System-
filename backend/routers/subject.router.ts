import { Router } from "express";
import {
    getSubjectsByDept,
    createSubject,
    assignTeacher,
    updateSubject,
} from "../controller/subject.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// Read: any authenticated user in the institute
router.get(
    "/:deptId",
    isAuthenticated,
    authorize("teacher", "hod", "principal", "admin"),
    getSubjectsByDept,
);

// Write: HOD and above only
router.post(
    "/",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    createSubject,
);
router.put(
    "/:id",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    updateSubject,
);
router.patch(
    "/:id/assign-teacher",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    assignTeacher,
);

export default router;
