import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";
import DepartmentModel from "../models/department.model.ts";
import UserModel from "../models/user.model.ts";
import {
    createDepartmentValidation,
    updateDepartmentValidation,
    assignHODValidation,
} from "../validations/department.validations.ts";

// ─── GET ALL DEPARTMENTS ──────────────────────────────────────────────────────
export const getDepartments = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { search = "", isActive = "" } = req.query as Record<
                string,
                string
            >;

            const user = await UserModel.findById(String(req.session.user?.id));
            if (!user) return next(new ErrorResponse("User not found", 404));

            const filter: Record<string, any> = { institute: user.institute };
            if (isActive !== "") filter.isActive = isActive === "true";
            if (search) filter.name = { $regex: search, $options: "i" };

            const departments = await DepartmentModel.find(filter)
                .populate("hod", "firstName lastName email role")
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: departments,
                total: departments.length,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── GET SINGLE DEPARTMENT ────────────────────────────────────────────────────
export const getDepartment = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid department ID", 400));

            const dept = await DepartmentModel.findById(id).populate(
                "hod",
                "firstName lastName email role isActive",
            );
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            res.status(200).json({ success: true, data: dept });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CREATE DEPARTMENT ────────────────────────────────────────────────────────
export const createDepartment = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = createDepartmentValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const user = await UserModel.findById(String(req.session.user?.id));
            if (!user) return next(new ErrorResponse("User not found", 404));

            const existing = await DepartmentModel.findOne({
                institute: user.institute,
                code: validation.data.code.toUpperCase(),
            });
            if (existing)
                return next(
                    new ErrorResponse(
                        "Department code already exists in this institute",
                        409,
                    ),
                );

            const dept = await DepartmentModel.create({
                ...validation.data,
                institute: user.institute,
            });

            res.status(201).json({
                success: true,
                message: "Department created successfully",
                data: dept,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── UPDATE DEPARTMENT ────────────────────────────────────────────────────────
export const updateDepartment = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid department ID", 400));

            const validation = updateDepartmentValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const dept = await DepartmentModel.findByIdAndUpdate(
                id,
                { $set: validation.data },
                { new: true },
            ).populate("hod", "firstName lastName email");
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            res.status(200).json({
                success: true,
                message: "Department updated successfully",
                data: dept,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── TOGGLE STATUS ────────────────────────────────────────────────────────────
export const toggleDepartmentStatus = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid department ID", 400));

            const dept = await DepartmentModel.findById(id);
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            dept.isActive = !dept.isActive;
            await dept.save();

            res.status(200).json({
                success: true,
                message: `Department ${dept.isActive ? "activated" : "deactivated"} successfully`,
                data: dept,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── ASSIGN HOD ───────────────────────────────────────────────────────────────
export const assignHOD = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid department ID", 400));

            const validation = assignHODValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const { hodId } = validation.data;
            if (!mongoose.Types.ObjectId.isValid(hodId))
                return next(new ErrorResponse("Invalid HOD user ID", 400));

            const hodUser = await UserModel.findById(hodId);
            if (!hodUser)
                return next(new ErrorResponse("HOD user not found", 404));
            if (!["hod", "principal", "admin"].includes(hodUser.role))
                return next(
                    new ErrorResponse(
                        "User must have role hod, principal, or admin",
                        400,
                    ),
                );

            // Unset department for any previously assigned HOD in this institute
            await UserModel.updateMany(
                {
                    institute: hodUser.institute,
                    department: new mongoose.Types.ObjectId(id),
                },
                { $unset: { department: "" } },
            );

            // Ensure one HOD per dept in the institute
            await DepartmentModel.updateMany(
                {
                    institute: hodUser.institute,
                    hod: new mongoose.Types.ObjectId(hodId),
                    _id: { $ne: new mongoose.Types.ObjectId(id) },
                },
                { $set: { hod: null } },
            );

            // Set the new HOD on the department
            const dept = await DepartmentModel.findByIdAndUpdate(
                id,
                { $set: { hod: new mongoose.Types.ObjectId(hodId) } },
                { new: true },
            ).populate("hod", "firstName lastName email role");
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            // Set the department on the HOD user
            await UserModel.findByIdAndUpdate(hodId, {
                $set: { department: new mongoose.Types.ObjectId(id) },
            });

            res.status(200).json({
                success: true,
                message: "HOD assigned successfully",
                data: dept,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── REMOVE HOD ───────────────────────────────────────────────────────────────
export const removeHOD = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid department ID", 400));

            const dept = await DepartmentModel.findByIdAndUpdate(id, {
                $set: { hod: null },
            });
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            if (dept.hod) {
                await UserModel.findByIdAndUpdate(dept.hod, {
                    $unset: { department: "" },
                });
            }

            res.status(200).json({
                success: true,
                message: "HOD removed successfully",
                data: dept,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE DEPARTMENT ────────────────────────────────────────────────────────
export const deleteDepartment = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid department ID", 400));

            const dept = await DepartmentModel.findByIdAndDelete(id);
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            res.status(200).json({
                success: true,
                message: "Department deleted successfully",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
