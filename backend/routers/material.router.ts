import { Router } from "express";
import {
    createMaterial,
    getMaterialsBySubject,
    deleteMaterial,
    getMaterialsByDept,
} from "../controller/material.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/", isAuthenticated, authorize("teacher"), createMaterial);
router.delete("/:id", isAuthenticated, authorize("teacher"), deleteMaterial);
router.get(
    "/subject/:subjectId",
    isAuthenticated,
    authorize("teacher", "student", "hod", "principal"),
    getMaterialsBySubject,
);
router.get(
    "/dept",
    isAuthenticated,
    authorize("hod", "principal", "admin"),
    getMaterialsByDept,
);

export default router;
