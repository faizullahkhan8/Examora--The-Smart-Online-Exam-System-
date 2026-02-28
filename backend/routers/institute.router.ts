import { Router } from "express";
import {
    getAllInstitutes,
    getInstituteById,
    createInstitute,
    updateInstitute,
    deleteInstitute,
    toggleInstituteStatus,
    assignPrincipal,
    getMyInstitute,
    updateMyInstitute,
} from "../controller/institute.controller.ts";
import { isAuthenticated, authorize } from "../middlewares/auth.middleware.ts";

const router = Router();

// ─── Principal-only routes (own institute only) ───────────────────────────────
router.get(
    "/my",
    isAuthenticated,
    authorize("principal", "admin"),
    getMyInstitute,
);
router.put(
    "/my",
    isAuthenticated,
    authorize("principal", "admin"),
    updateMyInstitute,
);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.use(isAuthenticated, authorize("admin"));

router.get("/", getAllInstitutes);
router.get("/:id", getInstituteById);
router.post("/", createInstitute);
router.put("/:id", updateInstitute);
router.delete("/:id", deleteInstitute);
router.patch("/:id/toggle-status", toggleInstituteStatus);
router.patch("/:id/assign-principal", assignPrincipal);

export default router;
