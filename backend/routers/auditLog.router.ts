import { Router } from "express";
import { getAuditLogById, getAuditLogs } from "../controller/auditLog.controller.ts";
import { authorize, isAuthenticated } from "../middlewares/auth.middleware.ts";

const router = Router();

router.use(isAuthenticated, authorize("admin"));

router.get("/", getAuditLogs);
router.get("/:id", getAuditLogById);

export default router;
