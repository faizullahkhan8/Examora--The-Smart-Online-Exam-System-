import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { ErrorResponse } from "../middlewares/error.handler.ts";
import UserModel from "../models/user.model.ts";
import AcademicSessionModel from "../models/academicSession.model.ts";
import { createFacultyValidation } from "../validations/hod.validations.ts";

// ─── Shared helper — resolves HOD + validates they belong to a dept ────────────
const resolveHOD = async (req: Request) => {
    const hod = await UserModel.findById(req.session.user?.id).lean();
    if (!hod) throw new ErrorResponse("User not found", 404);
    if (hod.role !== "hod") throw new ErrorResponse("Access denied", 403);
    if (!hod.department)
        throw new ErrorResponse("HOD has no assigned department", 400);
    return hod;
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getHODProfile = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hod = await UserModel.findById(req.session.user?.id)
                .populate("department")
                .populate("institute")
                .select("-password");
            if (!hod) return next(new ErrorResponse("User not found", 404));
            res.status(200).json({ success: true, data: hod });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hod = await resolveHOD(req);
            const [sessions, facultyCount, studentCount] = await Promise.all([
                AcademicSessionModel.find({ department: hod.department })
                    .sort({ startYear: -1 })
                    .lean(),
                UserModel.countDocuments({
                    department: hod.department,
                    role: "teacher",
                }),
                UserModel.countDocuments({
                    department: hod.department,
                    role: "student",
                }),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    sessions,
                    stats: {
                        totalSessions: sessions.length,
                        activeSessions: sessions.filter(
                            (s) => s.status === "active",
                        ).length,
                        facultyCount,
                        studentCount,
                    },
                },
            });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── Faculty list ─────────────────────────────────────────────────────────────
export const getFacultyList = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hod = await resolveHOD(req);
            const faculty = await UserModel.find({
                department: hod.department,
                role: "teacher",
            })
                .select("-password")
                .sort({ createdAt: -1 })
                .lean();
            res.status(200).json({ success: true, data: faculty });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── Create faculty ───────────────────────────────────────────────────────────
export const createFaculty = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hod = await resolveHOD(req);

            const parsed = createFacultyValidation.safeParse(req.body);
            if (!parsed.success) {
                return next(
                    new ErrorResponse(parsed.error.errors[0].message, 400),
                );
            }

            const exists = await UserModel.findOne({
                email: parsed.data.email,
            });
            if (exists)
                return next(new ErrorResponse("Email already registered", 400));

            const teacher = await UserModel.create({
                ...parsed.data,
                role: "teacher",
                department: hod.department,
                institute: hod.institute,
                isVerified: true,
            });

            const { password: _pw, ...safe } =
                (teacher as any)._doc ?? teacher.toObject();
            res.status(201).json({
                success: true,
                message: "Faculty created successfully",
                data: safe,
            });
        } catch (e: any) {
            next(e);
        }
    },
);

// ─── Toggle faculty active / suspended ───────────────────────────────────────
export const toggleFacultyStatus = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hod = await resolveHOD(req);
            const teacher = await UserModel.findOne({
                _id: req.params.id,
                department: hod.department,
                role: "teacher",
            });
            if (!teacher)
                return next(
                    new ErrorResponse(
                        "Faculty not found in your department",
                        404,
                    ),
                );

            teacher.isActive = !teacher.isActive;
            await teacher.save();

            res.status(200).json({
                success: true,
                message: `Faculty ${teacher.isActive ? "activated" : "suspended"}`,
                data: teacher,
            });
        } catch (e: any) {
            next(e);
        }
    },
);
