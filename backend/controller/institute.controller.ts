import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// models
import InstituteModel from "../models/institute.model.ts";
import UserModel from "../models/user.model.ts";

// validations
import {
    createInstituteValidation,
    updateInstituteValidation,
    assignPrincipalValidation,
} from "../validations/institute.validations.ts";

// ─── GET ALL INSTITUTES ───────────────────────────────────────────────────────
export const getAllInstitutes = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                search = "",
                page = "1",
                limit = "20",
            } = req.query as { search?: string; page?: string; limit?: string };

            const filter: Record<string, any> = {};
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { "location.city": { $regex: search, $options: "i" } },
                    { "location.country": { $regex: search, $options: "i" } },
                ];
            }

            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(100, parseInt(limit));
            const skip = (pageNum - 1) * limitNum;

            const [institutes, total] = await Promise.all([
                InstituteModel.find(filter)
                    .populate("principal", "firstName lastName email")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum),
                InstituteModel.countDocuments(filter),
            ]);

            res.status(200).json({
                success: true,
                data: institutes,
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

// ─── GET INSTITUTE BY ID ──────────────────────────────────────────────────────
export const getInstituteById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const institute = await InstituteModel.findById(
                req.params.id,
            ).populate("principal", "firstName lastName email role");
            if (!institute)
                return next(new ErrorResponse("Institute not found", 404));
            res.status(200).json({ success: true, data: institute });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CREATE INSTITUTE ─────────────────────────────────────────────────────────
export const createInstitute = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = createInstituteValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const existing = await InstituteModel.findOne({
                name: validation.data.name,
            });
            if (existing)
                return next(
                    new ErrorResponse(
                        "An institute with this name already exists",
                        409,
                    ),
                );

            const institute = await InstituteModel.create(validation.data);
            res.status(201).json({
                success: true,
                message: "Institute created successfully",
                data: institute,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── UPDATE INSTITUTE ─────────────────────────────────────────────────────────
export const updateInstitute = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = updateInstituteValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const institute = await InstituteModel.findByIdAndUpdate(
                req.params.id,
                { $set: validation.data },
                { new: true, runValidators: true },
            ).populate("principal", "firstName lastName email");

            if (!institute)
                return next(new ErrorResponse("Institute not found", 404));
            res.status(200).json({
                success: true,
                message: "Institute updated successfully",
                data: institute,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE INSTITUTE ─────────────────────────────────────────────────────────
export const deleteInstitute = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const institute = await InstituteModel.findByIdAndDelete(
                req.params.id,
            );
            if (!institute)
                return next(new ErrorResponse("Institute not found", 404));
            res.status(200).json({
                success: true,
                message: "Institute deleted successfully",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── TOGGLE INSTITUTE STATUS ──────────────────────────────────────────────────
export const toggleInstituteStatus = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const institute = await InstituteModel.findById(req.params.id);
            if (!institute)
                return next(new ErrorResponse("Institute not found", 404));

            institute.isActive = !institute.isActive;
            await institute.save();

            res.status(200).json({
                success: true,
                message: `Institute ${institute.isActive ? "activated" : "suspended"} successfully`,
                data: institute,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── ASSIGN PRINCIPAL ─────────────────────────────────────────────────────────
export const assignPrincipal = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = assignPrincipalValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const { principalId } = validation.data;
            const user = await UserModel.findById(principalId);
            if (!user) return next(new ErrorResponse("User not found", 404));
            if (user.role !== "principal" && user.role !== "admin")
                return next(
                    new ErrorResponse(
                        "Assigned user must have the 'principal' role",
                        400,
                    ),
                );

            const institute = await InstituteModel.findByIdAndUpdate(
                req.params.id,
                { $set: { principal: principalId } },
                { new: true },
            ).populate("principal", "firstName lastName email role");

            if (!institute)
                return next(new ErrorResponse("Institute not found", 404));
            res.status(200).json({
                success: true,
                message: "Principal assigned successfully",
                data: institute,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── GET OWN INSTITUTE (Principal) ───────────────────────────────────────────
export const getMyInstitute = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionUser = await UserModel.findById(
                String(req.session.user?.id),
            );
            if (!sessionUser)
                return next(new ErrorResponse("User not found", 404));

            const institute = await InstituteModel.findById(
                sessionUser.institute,
            ).populate("principal", "firstName lastName email role");

            if (!institute)
                return next(
                    new ErrorResponse(
                        "No institute linked to your account",
                        404,
                    ),
                );

            res.status(200).json({ success: true, data: institute });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── UPDATE OWN INSTITUTE (Principal) ────────────────────────────────────────
export const updateMyInstitute = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = updateInstituteValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const sessionUser = await UserModel.findById(
                String(req.session.user?.id),
            );
            if (!sessionUser)
                return next(new ErrorResponse("User not found", 404));

            const institute = await InstituteModel.findByIdAndUpdate(
                sessionUser.institute,
                { $set: validation.data },
                { new: true, runValidators: true },
            ).populate("principal", "firstName lastName email");

            if (!institute)
                return next(new ErrorResponse("Institute not found", 404));

            res.status(200).json({
                success: true,
                message: "Institute updated successfully",
                data: institute,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
