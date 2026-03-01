import { Router } from "express";
import {
    createExamPaper,
    updateExamPaper,
    submitExamPaper,
    getMyExamPapers,
    getExamPapersBySubject,
    approveExamPaper,
    getDeptExamPapers,
} from "../controller/examPaper.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// Teacher routes
router.get("/my", isAuthenticated, authorize("teacher"), getMyExamPapers);
router.post("/", isAuthenticated, authorize("teacher"), createExamPaper);
router.put("/:id", isAuthenticated, authorize("teacher"), updateExamPaper);
router.patch(
    "/:id/submit",
    isAuthenticated,
    authorize("teacher"),
    submitExamPaper,
);

// Shared read routes
router.get(
    "/subject/:subjectId",
    isAuthenticated,
    authorize("teacher", "hod", "principal", "admin"),
    getExamPapersBySubject,
);

// HOD routes
router.get(
    "/dept",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    getDeptExamPapers,
);
router.patch(
    "/:id/review",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    approveExamPaper,
);

export default router;
