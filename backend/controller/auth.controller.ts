import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// models
import UserModel from "../models/user.model.ts";

// validations
import {
    loginValidation,
    registerValidation,
} from "../validations/auth.validations.ts";

export const login = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = loginValidation.safeParse(req.body);

            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const { email, password } = validation.data;

            const user = await UserModel.findOne({ email });

            if (!user) {
                return next(new ErrorResponse("Invalid credentials", 401));
            }

            const isPasswordValid = await user.matchPassword(password);

            if (!isPasswordValid) {
                return next(new ErrorResponse("Invalid credentials", 401));
            }

            req.session.user = {
                id: user._id,
                role: user.role,
            };

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                user,
            });
        } catch (error: any) {
            console.log("Error in Login controlller : ", error.message);
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

export const register = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = registerValidation.safeParse(req.body);

            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const {
                firstName,
                lastName,
                email,
                password,
                role,
                department,
                institute,
            } = validation.data;

            // Check if user | admin (if creating) already exists
            const existingUser = await UserModel.findOne({ email });

            if (existingUser && existingUser.role === "admin") {
                return next(new ErrorResponse("Admin already exists", 409));
            } else if (existingUser) {
                return next(
                    new ErrorResponse(
                        "User already exists with this email",
                        409,
                    ),
                );
            }

            // Create user
            const user = await UserModel.create({
                firstName,
                lastName,
                email,
                password,
                role,
                isVerified: role === "admin",
                department: department || "6988c52663224388d9e058ad",
                institute: institute || "6988c52663224388d9e058ae",
            });

            req.session.user = {
                id: user._id,
                role: user.role,
            };

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                user,
            });
        } catch (error: any) {
            console.log("Error in Register controller:", error.message);
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

export const logout = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.session) {
                return next(new ErrorResponse("No active session found", 400));
            }

            req.session.destroy((err) => {
                if (err) {
                    return next(
                        new ErrorResponse("Failed to logout user", 500),
                    );
                }

                res.clearCookie("connect.sid", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                });

                return res.status(200).json({
                    success: true,
                    message: "User logged out successfully",
                });
            });
        } catch (error: any) {
            console.log("Error in Logout controller:", error.message);
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
