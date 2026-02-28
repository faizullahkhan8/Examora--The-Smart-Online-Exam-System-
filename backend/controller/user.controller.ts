import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// models
import UserModel from "../models/user.model.ts";
import InstituteModel from "../models/institute.model.ts";

// validations
import {
    createUserValidation,
    updateUserValidation,
    resetPasswordValidation,
} from "../validations/user.validations.ts";

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
export const getAllUsers = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                search = "",
                role = "",
                institute = "",
                page = "1",
                limit = "10",
            } = req.query as {
                search?: string;
                role?: string;
                institute?: string;
                page?: string;
                limit?: string;
            };

            const filter: Record<string, any> = {};

            if (search) {
                filter.$or = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            if (role) filter.role = role;
            if (institute) filter.institute = institute;

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(100, parseInt(limit));
            const skip = (pageNum - 1) * limitNum;

            const [users, total, roleCounts] = await Promise.all([
                UserModel.find(filter)
                    .populate("institute", "name logoInitials")
                    .populate("department", "name")
                    .select("-password")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                UserModel.countDocuments(filter),
                // Aggregate counts per role (unfiltered to show global KPIs)
                UserModel.aggregate([
                    { $group: { _id: "$role", count: { $sum: 1 } } },
                ]),
            ]);

            const stats: Record<string, number> = {};
            for (const rc of roleCounts) {
                stats[rc._id] = rc.count;
            }

            res.status(200).json({
                success: true,
                data: users,
                stats,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── GET USER BY ID ───────────────────────────────────────────────────────────
export const getUserById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await UserModel.findById(req.params.id)
                .populate("institute", "name logoInitials")
                .populate("department", "name")
                .select("-password");

            if (!user) {
                return next(new ErrorResponse("User not found", 404));
            }

            res.status(200).json({ success: true, data: user });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CREATE USER ──────────────────────────────────────────────────────────────
export const createUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = createUserValidation.safeParse(req.body);

            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const existing = await UserModel.findOne({
                email: validation.data.email,
            });
            if (existing) {
                return next(
                    new ErrorResponse(
                        "A user with this email already exists",
                        409,
                    ),
                );
            }

            // If a role of 'principal' is assigned and an institute is provided,
            // bump that institute's principal field
            const user = await UserModel.create(validation.data);

            if (
                validation.data.role === "principal" &&
                validation.data.institute
            ) {
                await InstituteModel.findByIdAndUpdate(
                    validation.data.institute,
                    { $set: { principal: user._id } },
                );
            }

            const userResponse = await UserModel.findById(user._id)
                .populate("institute", "name logoInitials")
                .select("-password");

            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: userResponse,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── UPDATE USER ──────────────────────────────────────────────────────────────
export const updateUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = updateUserValidation.safeParse(req.body);

            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const user = await UserModel.findByIdAndUpdate(
                req.params.id,
                { $set: validation.data },
                { new: true, runValidators: true },
            )
                .populate("institute", "name logoInitials")
                .populate("department", "name")
                .select("-password");

            if (!user) {
                return next(new ErrorResponse("User not found", 404));
            }

            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE USER ──────────────────────────────────────────────────────────────
export const deleteUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await UserModel.findByIdAndDelete(req.params.id);

            if (!user) {
                return next(new ErrorResponse("User not found", 404));
            }

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── TOGGLE USER STATUS ───────────────────────────────────────────────────────
export const toggleUserStatus = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await UserModel.findById(req.params.id);

            if (!user) {
                return next(new ErrorResponse("User not found", 404));
            }

            user.isActive = !user.isActive;
            await user.save();

            const updatedUser = await UserModel.findById(user._id)
                .populate("institute", "name logoInitials")
                .select("-password");

            res.status(200).json({
                success: true,
                message: `User ${user.isActive ? "activated" : "suspended"} successfully`,
                data: updatedUser,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── ADMIN RESET PASSWORD ─────────────────────────────────────────────────────
export const adminResetPassword = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = resetPasswordValidation.safeParse(req.body);

            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const user = await UserModel.findById(req.params.id);

            if (!user) {
                return next(new ErrorResponse("User not found", 404));
            }

            user.password = validation.data.newPassword;
            await user.save(); // triggers the bcrypt pre-save hook

            res.status(200).json({
                success: true,
                message: "Password reset successfully",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
