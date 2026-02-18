import { Router } from "express";
import { login, logout, register } from "../controller/auth.controller.ts";
import { isAuthenticated } from "../middlewares/auth.middleware.ts";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", isAuthenticated, logout);

export default router;
