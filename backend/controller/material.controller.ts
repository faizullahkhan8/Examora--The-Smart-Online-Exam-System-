import expressAsyncHandler from "express-async-handler";
import type { Request, Response, NextFunction } from "express";
import MaterialModel from "../models/material.model.ts";
import SubjectModel from "../models/subject.model.ts";
import UserModel from "../models/user.model.ts";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// ─── CREATE MATERIAL ──────────────────────────────────────────────────────────
export const createMaterial = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacherId = req.session.user?.id;
            const { subjectId, title, type, content } = req.body;
            if (!subjectId || !title || !type || !content)
                return next(
                    new ErrorResponse(
                        "subjectId, title, type and content are required",
                        400,
                    ),
                );

            const subject = await SubjectModel.findById(subjectId);
            if (!subject)
                return next(new ErrorResponse("Subject not found", 404));
            if (String(subject.teacher) !== String(teacherId))
                return next(
                    new ErrorResponse(
                        "You are not assigned to this subject",
                        403,
                    ),
                );

            const material = await MaterialModel.create({
                subject: subject._id,
                teacher: teacherId,
                department: subject.department,
                title,
                type,
                content,
                semester: subject.semester,
            });

            res.status(201).json({
                success: true,
                message: "Material shared",
                data: material,
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── GET MATERIALS BY SUBJECT ─────────────────────────────────────────────────
export const getMaterialsBySubject = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { subjectId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(subjectId))
                return next(new ErrorResponse("Invalid subject ID", 400));

            const materials = await MaterialModel.find({ subject: subjectId })
                .populate("teacher", "firstName lastName")
                .sort({ createdAt: -1 })
                .lean();

            res.status(200).json({ success: true, data: materials });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── DELETE MATERIAL ──────────────────────────────────────────────────────────
export const deleteMaterial = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const teacherId = req.session.user?.id;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid material ID", 400));

            const material = await MaterialModel.findById(id);
            if (!material)
                return next(new ErrorResponse("Material not found", 404));
            if (String(material.teacher) !== String(teacherId))
                return next(
                    new ErrorResponse(
                        "Not authorized to delete this material",
                        403,
                    ),
                );

            await material.deleteOne();
            res.status(200).json({
                success: true,
                message: "Material deleted",
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── GET MATERIALS BY DEPT (HOD view) ─────────────────────────────────────────
export const getMaterialsByDept = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await UserModel.findById(req.session.user?.id);
            if (!user?.department)
                return next(new ErrorResponse("No department assigned", 400));

            const materials = await MaterialModel.find({
                department: user.department,
            })
                .populate("teacher", "firstName lastName")
                .populate("subject", "name code semester")
                .sort({ createdAt: -1 })
                .lean();

            res.status(200).json({ success: true, data: materials });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);
