import { Router } from "express";
import {
    getAllInstitutes,
    getInstituteById,
    createInstitute,
    updateInstitute,
    deleteInstitute,
    toggleInstituteStatus,
    assignPrincipal,
} from "../controller/institute.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// All institute routes require an authenticated admin session
router.use(isAuthenticated, authorize("admin"));

router.get("/", getAllInstitutes);
router.get("/:id", getInstituteById);
router.post("/", createInstitute);
router.put("/:id", updateInstitute);
router.delete("/:id", deleteInstitute);
router.patch("/:id/toggle-status", toggleInstituteStatus);
router.patch("/:id/assign-principal", assignPrincipal);

export default router;
