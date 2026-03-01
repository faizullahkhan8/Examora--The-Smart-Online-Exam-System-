import expressAsyncHandler from "express-async-handler";
import type { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model.ts";
import SubjectModel from "../models/subject.model.ts";
import AcademicSessionModel from "../models/academicSession.model.ts";
import ExamPaperModel from "../models/examPaper.model.ts";
import AttendanceModel from "../models/attendance.model.ts";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// ─── Helper: resolve teacher ──────────────────────────────────────────────────
async function resolveTeacher(req: Request) {
    const teacher = await UserModel.findById(req.session.user?.id)
        .populate("department")
        .populate("institute")
        .select("-password");
    if (!teacher) throw new ErrorResponse("Teacher not found", 404);
    if (teacher.role !== "teacher")
        throw new ErrorResponse("Access denied", 403);
    if (!teacher.department)
        throw new ErrorResponse("Teacher has no assigned department", 400);
    return teacher;
}

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
export const getTeacherProfile = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacher = await resolveTeacher(req);
            res.status(200).json({ success: true, data: teacher });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── GET DASHBOARD ────────────────────────────────────────────────────────────
export const getTeacherDashboard = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacher = await resolveTeacher(req);
            const deptId = teacher.department;

            const [subjects, examPapers, totalStudents] = await Promise.all([
                SubjectModel.find({
                    teacher: teacher._id,
                    isActive: true,
                }).lean(),
                ExamPaperModel.find({ teacher: teacher._id }).lean(),
                UserModel.countDocuments({
                    department: deptId,
                    role: "student",
                }),
            ]);

            const pendingPapers = examPapers.filter(
                (p) => p.status === "submitted",
            ).length;
            const draftPapers = examPapers.filter(
                (p) => p.status === "draft",
            ).length;
            const approvedPapers = examPapers.filter(
                (p) => p.status === "approved",
            ).length;

            res.status(200).json({
                success: true,
                data: {
                    subjects,
                    stats: {
                        totalSubjects: subjects.length,
                        totalStudents,
                        pendingPapers,
                        draftPapers,
                        approvedPapers,
                        totalPapers: examPapers.length,
                    },
                },
            });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── GET MY SUBJECTS ─────────────────────────────────────────────────────────
export const getMySubjects = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacher = await resolveTeacher(req);
            const subjects = await SubjectModel.find({
                teacher: teacher._id,
                isActive: true,
            })
                .populate("session", "startYear endYear currentSemester status")
                .populate("department", "name code")
                .sort({ semester: 1 })
                .lean();
            res.status(200).json({ success: true, data: subjects });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── GET SUBJECT BY ID ────────────────────────────────────────────────────────
export const getSubjectById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacher = await resolveTeacher(req);
            const subject = await SubjectModel.findOne({
                _id: req.params.id,
                teacher: teacher._id,
            })
                .populate("session", "startYear endYear currentSemester status")
                .populate("department", "name code")
                .lean();
            if (!subject)
                return next(
                    new ErrorResponse(
                        "Subject not found or not assigned to you",
                        404,
                    ),
                );
            res.status(200).json({ success: true, data: subject });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── GET STUDENTS IN SUBJECT ──────────────────────────────────────────────────
export const getSubjectStudents = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacher = await resolveTeacher(req);
            const subject = await SubjectModel.findOne({
                _id: req.params.id,
                teacher: teacher._id,
            });
            if (!subject)
                return next(
                    new ErrorResponse(
                        "Subject not found or not assigned to you",
                        404,
                    ),
                );

            const students = await UserModel.find({
                department: subject.department,
                role: "student",
                isActive: true,
            })
                .select("firstName lastName email isActive")
                .lean();

            res.status(200).json({ success: true, data: students });
        } catch (e: any) {
            next(e);
        }
    },
);
