import expressAsyncHandler from "express-async-handler";
import type { Request, Response, NextFunction } from "express";
import ExamPaperModel from "../models/examPaper.model.ts";
import SubjectModel from "../models/subject.model.ts";
import UserModel from "../models/user.model.ts";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// ─── Helper: ensure teacher owns the exam paper ───────────────────────────────
async function getTeacherPaper(paperId: string, teacherId: string) {
    if (!mongoose.Types.ObjectId.isValid(paperId))
        throw new ErrorResponse("Invalid paper ID", 400);
    const paper = await ExamPaperModel.findById(paperId);
    if (!paper) throw new ErrorResponse("Exam paper not found", 404);
    if (String(paper.teacher) !== String(teacherId))
        throw new ErrorResponse("Not authorized to modify this paper", 403);
    return paper;
}

// ─── CREATE EXAM PAPER ────────────────────────────────────────────────────────
export const createExamPaper = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacherId = req.session.user?.id;
            const { subjectId, title, questions, totalMarks, duration } =
                req.body;

            if (!subjectId || !title || !totalMarks || !duration)
                return next(
                    new ErrorResponse(
                        "subjectId, title, totalMarks and duration are required",
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

            const teacher = await UserModel.findById(teacherId);
            if (!teacher)
                return next(new ErrorResponse("Teacher not found", 404));

            const paper = await ExamPaperModel.create({
                subject: subject._id,
                teacher: teacher._id,
                department: subject.department,
                session: subject.session,
                semester: subject.semester,
                title,
                questions: questions ?? [],
                totalMarks,
                duration,
                status: "draft",
            });

            res.status(201).json({
                success: true,
                message: "Exam paper created",
                data: paper,
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── UPDATE EXAM PAPER ────────────────────────────────────────────────────────
export const updateExamPaper = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paper = await getTeacherPaper(
                req.params.id,
                req.session.user!.id,
            );
            if (paper.status !== "draft")
                return next(
                    new ErrorResponse("Only draft papers can be edited", 400),
                );
            Object.assign(paper, req.body);
            await paper.save();
            res.status(200).json({
                success: true,
                message: "Paper updated",
                data: paper,
            });
        } catch (e: any) {
            next(
                e instanceof ErrorResponse
                    ? e
                    : new ErrorResponse(e.message, 500),
            );
        }
    },
);

// ─── SUBMIT EXAM PAPER ────────────────────────────────────────────────────────
export const submitExamPaper = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paper = await getTeacherPaper(
                req.params.id,
                req.session.user!.id,
            );
            if (paper.status !== "draft")
                return next(
                    new ErrorResponse(
                        "Only draft papers can be submitted",
                        400,
                    ),
                );
            paper.status = "submitted";
            await paper.save();
            res.status(200).json({
                success: true,
                message: "Paper submitted for HOD review",
                data: paper,
            });
        } catch (e: any) {
            next(
                e instanceof ErrorResponse
                    ? e
                    : new ErrorResponse(e.message, 500),
            );
        }
    },
);

// ─── GET MY EXAM PAPERS ───────────────────────────────────────────────────────
export const getMyExamPapers = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const papers = await ExamPaperModel.find({
                teacher: req.session.user?.id,
            })
                .populate("subject", "name code semester")
                .sort({ createdAt: -1 })
                .lean();
            res.status(200).json({ success: true, data: papers });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── GET EXAM PAPERS BY SUBJECT ───────────────────────────────────────────────
export const getExamPapersBySubject = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { subjectId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(subjectId))
                return next(new ErrorResponse("Invalid subject ID", 400));

            const papers = await ExamPaperModel.find({ subject: subjectId })
                .populate("teacher", "firstName lastName")
                .sort({ createdAt: -1 })
                .lean();
            res.status(200).json({ success: true, data: papers });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── APPROVE / REJECT (HOD only) ──────────────────────────────────────────────
export const approveExamPaper = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { action, reason } = req.body; // action: 'approve' | 'reject'
            if (!["approve", "reject"].includes(action))
                return next(
                    new ErrorResponse(
                        "action must be 'approve' or 'reject'",
                        400,
                    ),
                );

            const paper = await ExamPaperModel.findById(id);
            if (!paper)
                return next(new ErrorResponse("Exam paper not found", 404));
            if (paper.status !== "submitted")
                return next(
                    new ErrorResponse(
                        "Only submitted papers can be reviewed",
                        400,
                    ),
                );

            paper.status = action === "approve" ? "approved" : "rejected";
            if (action === "reject")
                paper.rejectionReason = reason ?? "No reason provided";
            await paper.save();

            res.status(200).json({
                success: true,
                message: `Paper ${action}d successfully`,
                data: paper,
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── GET DEPT EXAM PAPERS (HOD) ───────────────────────────────────────────────
export const getDeptExamPapers = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await UserModel.findById(req.session.user?.id);
            if (!user?.department)
                return next(new ErrorResponse("No department assigned", 400));

            const papers = await ExamPaperModel.find({
                department: user.department,
            })
                .populate("teacher", "firstName lastName")
                .populate("subject", "name code semester")
                .sort({ createdAt: -1 })
                .lean();
            res.status(200).json({ success: true, data: papers });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);
