import { Router } from "express";
import {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    assignHOD,
    removeHOD,
    deleteDepartment,
} from "../controller/department.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

router.use(isAuthenticated);

router.get("/", getDepartments);
router.get("/:id", getDepartment);
router.post("/", authorize("principal", "admin"), createDepartment);
router.patch("/:id", authorize("principal", "admin"), updateDepartment);
router.patch(
    "/:id/toggle-status",
    authorize("principal", "admin"),
    toggleDepartmentStatus,
);
router.patch("/:id/assign-hod", authorize("principal", "admin"), assignHOD);
router.patch("/:id/remove-hod", authorize("principal", "admin"), removeHOD);
router.delete("/:id", authorize("principal", "admin"), deleteDepartment);

export default router;
