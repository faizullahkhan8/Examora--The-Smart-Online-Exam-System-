import expressAsyncHandler from "express-async-handler";
import type { Request, Response, NextFunction } from "express";
import SubjectModel from "../models/subject.model.ts";
import UserModel from "../models/user.model.ts";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// ─── GET SUBJECTS BY DEPT ─────────────────────────────────────────────────────
export const getSubjectsByDept = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deptId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(deptId))
                return next(new ErrorResponse("Invalid department ID", 400));

            const subjects = await SubjectModel.find({
                department: deptId,
                isActive: true,
            })
                .populate("teacher", "firstName lastName email")
                .populate("session", "startYear endYear currentSemester")
                .sort({ semester: 1 })
                .lean();

            res.status(200).json({ success: true, data: subjects });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── CREATE SUBJECT (HOD only) ────────────────────────────────────────────────
export const createSubject = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                name,
                code,
                department,
                session,
                semester,
                teacher,
                creditHours,
            } = req.body;
            if (!name || !code || !department || !session || !semester)
                return next(
                    new ErrorResponse(
                        "name, code, department, session, semester are required",
                        400,
                    ),
                );

            // Verify the teacher belongs to that department (if provided)
            if (teacher) {
                const teacherUser = await UserModel.findById(teacher);
                if (!teacherUser || teacherUser.role !== "teacher")
                    return next(
                        new ErrorResponse("User is not a teacher", 400),
                    );
                if (String(teacherUser.department) !== String(department))
                    return next(
                        new ErrorResponse(
                            "Teacher does not belong to this department",
                            403,
                        ),
                    );
            }

            const subject = await SubjectModel.create({
                name,
                code,
                department,
                session,
                semester,
                teacher: teacher || undefined,
                creditHours: creditHours ?? 3,
            });

            res.status(201).json({
                success: true,
                message: "Subject created",
                data: subject,
            });
        } catch (e: any) {
            if (e.code === 11000)
                return next(
                    new ErrorResponse(
                        "A subject with this code already exists in this department/session",
                        409,
                    ),
                );
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── ASSIGN TEACHER (HOD only) ────────────────────────────────────────────────
export const assignTeacher = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params; // subject ID
            const { teacherId } = req.body;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid subject ID", 400));

            const subject = await SubjectModel.findById(id);
            if (!subject)
                return next(new ErrorResponse("Subject not found", 404));

            if (teacherId) {
                const teacherUser = await UserModel.findById(teacherId);
                if (!teacherUser || teacherUser.role !== "teacher")
                    return next(
                        new ErrorResponse("User is not a teacher", 400),
                    );
                if (
                    String(teacherUser.department) !==
                    String(subject.department)
                )
                    return next(
                        new ErrorResponse(
                            "Teacher does not belong to this department",
                            403,
                        ),
                    );
                subject.teacher = teacherUser._id;
            } else {
                // unassign
                subject.teacher = undefined;
            }

            await subject.save();
            const updated = await SubjectModel.findById(id)
                .populate("teacher", "firstName lastName email")
                .lean();

            res.status(200).json({
                success: true,
                message: "Teacher assigned",
                data: updated,
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── UPDATE SUBJECT ───────────────────────────────────────────────────────────
export const updateSubject = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return next(new ErrorResponse("Invalid subject ID", 400));

            const subject = await SubjectModel.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            if (!subject)
                return next(new ErrorResponse("Subject not found", 404));

            res.status(200).json({
                success: true,
                message: "Subject updated",
                data: subject,
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);
