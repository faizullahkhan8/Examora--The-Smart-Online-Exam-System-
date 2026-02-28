import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";

import AcademicSessionModel from "../models/academicSession.model.ts";
import DepartmentModel from "../models/department.model.ts";
import UserModel from "../models/user.model.ts";

import {
    createSessionValidation,
    updateSessionValidation,
    manualPromoteValidation,
} from "../validations/academicSession.validations.ts";

// ─── SHARED UTILITY: Semester Promotion ──────────────────────────────────────
//
// Called by:
//   1. Daily cron job (automated promotion when nextPromotionDate is passed)
//   2. HOD / Principal / Admin manual PATCH /promote endpoint
//   3. Future: Exam module (PATCH /exam-promote after all students pass final exam)
//
export async function promoteSemester(
    sessionId: string,
    mongoSession?: mongoose.ClientSession,
): Promise<{ promoted: boolean; completed: boolean; newSemester?: number }> {
    const opts = mongoSession ? { session: mongoSession } : {};
    const session = await AcademicSessionModel.findById(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.status !== "active")
        throw new Error("Only active sessions can be promoted");

    if (session.currentSemester >= 8) {
        // Final semester — mark completed, graduate students
        session.status = "completed";
        await session.save(opts);

        // Update all students in this session to graduated (when Student model exists)
        // await StudentModel.updateMany({ academicSession: session._id }, { $set: { status: "graduated" } }, opts);

        return { promoted: true, completed: true };
    }

    const sixMonthsLater = new Date(session.nextPromotionDate);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    session.currentSemester += 1;
    session.nextPromotionDate = sixMonthsLater;
    await session.save(opts);

    return {
        promoted: true,
        completed: false,
        newSemester: session.currentSemester,
    };
}

// ─── GET SESSIONS BY DEPARTMENT ───────────────────────────────────────────────
export const getSessionsByDepartment = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deptId } = req.params;
            const sessionUser = await UserModel.findById(
                String(req.session.user?.id),
            );
            if (!sessionUser)
                return next(new ErrorResponse("User not found", 404));

            // Scope: dept must belong to session user's institute
            const dept = await DepartmentModel.findOne({
                _id: deptId,
                institute: sessionUser.institute,
            });
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            const sessions = await AcademicSessionModel.find({
                department: deptId,
                institute: sessionUser.institute,
            })
                .populate("createdBy", "firstName lastName")
                .sort({ startYear: -1 });

            res.status(200).json({ success: true, data: sessions });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── GET SESSION BY ID ────────────────────────────────────────────────────────
export const getSessionById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await AcademicSessionModel.findById(req.params.id)
                .populate("department", "name code")
                .populate("createdBy", "firstName lastName");
            if (!session)
                return next(new ErrorResponse("Session not found", 404));
            res.status(200).json({ success: true, data: session });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CREATE SESSION ───────────────────────────────────────────────────────────
export const createSession = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { deptId } = req.params;
            const validation = createSessionValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const sessionUser = await UserModel.findById(
                String(req.session.user?.id),
            );
            if (!sessionUser)
                return next(new ErrorResponse("User not found", 404));

            // Ensure dept belongs to the principal's institute
            const dept = await DepartmentModel.findOne({
                _id: deptId,
                institute: sessionUser.institute,
            });
            if (!dept)
                return next(new ErrorResponse("Department not found", 404));

            const { startYear, intakeCapacity } = validation.data;

            // Enforce: max 4 active sessions per department
            const activeCount = await AcademicSessionModel.countDocuments({
                department: deptId,
                status: { $in: ["upcoming", "active"] },
            });
            if (activeCount >= 4) {
                return next(
                    new ErrorResponse(
                        "A department can have at most 4 active sessions at a time",
                        400,
                    ),
                );
            }

            // nextPromotionDate = 6 months from now (enrollment period)
            const nextPromotion = new Date();
            nextPromotion.setMonth(nextPromotion.getMonth() + 6);

            const session = await AcademicSessionModel.create({
                startYear,
                endYear: startYear + 4,
                department: deptId,
                institute: sessionUser.institute,
                intakeCapacity: intakeCapacity ?? 60,
                nextPromotionDate: nextPromotion,
                createdBy: sessionUser._id,
            });

            res.status(201).json({
                success: true,
                message: "Academic session created successfully",
                data: session,
            });
        } catch (error: any) {
            if (error.code === 11000)
                return next(
                    new ErrorResponse(
                        `A session for ${req.body.startYear} already exists in this department`,
                        409,
                    ),
                );
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── UPDATE SESSION ───────────────────────────────────────────────────────────
export const updateSession = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = updateSessionValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const session = await AcademicSessionModel.findById(req.params.id);
            if (!session)
                return next(new ErrorResponse("Session not found", 404));
            if (session.status === "completed")
                return next(
                    new ErrorResponse(
                        "Completed sessions cannot be modified",
                        400,
                    ),
                );

            // Guard: intakeCapacity cannot be changed once enrollment is closed
            if (
                validation.data.intakeCapacity !== undefined &&
                !session.enrollmentOpen
            ) {
                return next(
                    new ErrorResponse(
                        "Enrollment is closed. Unlock the session first to change intake capacity.",
                        403,
                    ),
                );
            }

            Object.assign(session, validation.data);
            await session.save();

            res.status(200).json({
                success: true,
                message: "Session updated",
                data: session,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── LOCK SESSION ─────────────────────────────────────────────────────────────
export const lockSession = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await AcademicSessionModel.findById(req.params.id);
            if (!session)
                return next(new ErrorResponse("Session not found", 404));
            if (session.status === "completed")
                return next(
                    new ErrorResponse(
                        "Completed sessions cannot be locked",
                        400,
                    ),
                );

            session.status = "locked";
            await session.save();
            res.status(200).json({
                success: true,
                message: "Session locked",
                data: session,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── UNLOCK SESSION ───────────────────────────────────────────────────────────
export const unlockSession = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await AcademicSessionModel.findById(req.params.id);
            if (!session)
                return next(new ErrorResponse("Session not found", 404));
            if (session.status !== "locked")
                return next(new ErrorResponse("Session is not locked", 400));

            // Restore to the correct prior status
            session.status = session.enrollmentOpen ? "upcoming" : "active";
            await session.save();
            res.status(200).json({
                success: true,
                message: "Session unlocked",
                data: session,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── CLOSE ENROLLMENT ────────────────────────────────────────────────────────
export const closeEnrollment = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await AcademicSessionModel.findById(req.params.id);
            if (!session)
                return next(new ErrorResponse("Session not found", 404));
            if (!session.enrollmentOpen)
                return next(
                    new ErrorResponse("Enrollment is already closed", 400),
                );

            session.enrollmentOpen = false;
            session.status = "active";
            await session.save();
            res.status(200).json({
                success: true,
                message: "Enrollment closed — session is now active",
                data: session,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── MANUAL PROMOTE (HOD / Principal / Admin) ────────────────────────────────
export const manualPromote = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validation = manualPromoteValidation.safeParse(req.body);
            if (!validation.success)
                return next(new ErrorResponse(validation.error.message, 400));

            const sessionUser = await UserModel.findById(
                String(req.session.user?.id),
            );
            if (!sessionUser)
                return next(new ErrorResponse("User not found", 404));

            const academicSession = await AcademicSessionModel.findById(
                req.params.id,
            ).populate("department", "hod");
            if (!academicSession)
                return next(new ErrorResponse("Session not found", 404));

            // HOD can only promote sessions belonging to their own department
            if (sessionUser.role === "hod") {
                const dept = academicSession.department as any;
                if (
                    !dept.hod ||
                    dept.hod.toString() !== sessionUser._id.toString()
                ) {
                    return next(
                        new ErrorResponse(
                            "You are not the HOD of this department",
                            403,
                        ),
                    );
                }
            }

            const mongoSession = await mongoose.startSession();
            let result;
            try {
                await mongoSession.withTransaction(async () => {
                    result = await promoteSemester(req.params.id, mongoSession);
                });
            } finally {
                await mongoSession.endSession();
            }

            const updated = await AcademicSessionModel.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: result!.completed
                    ? "Cohort graduated — session marked completed"
                    : `Promoted to Semester ${result!.newSemester}`,
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── EXAM-TRIGGERED PROMOTE (Internal hook — used by Exam module) ─────────────
// No UI. Called programmatically by the Exam controller after all final exams pass.
export const examTriggerPromote = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const mongoSession = await mongoose.startSession();
            let result;
            try {
                await mongoSession.withTransaction(async () => {
                    result = await promoteSemester(req.params.id, mongoSession);
                });
            } finally {
                await mongoSession.endSession();
            }

            const updated = await AcademicSessionModel.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: result!.completed
                    ? "Session completed"
                    : `Promoted to Semester ${result!.newSemester}`,
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export const getSessionAnalytics = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionUser = await UserModel.findById(
                String(req.session.user?.id),
            );
            if (!sessionUser)
                return next(new ErrorResponse("User not found", 404));

            const [all, byStatus] = await Promise.all([
                AcademicSessionModel.find({
                    institute: sessionUser.institute,
                }).populate("department", "name code"),
                AcademicSessionModel.aggregate([
                    { $match: { institute: sessionUser.institute } },
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                            totalStudents: { $sum: "$totalEnrolledStudents" },
                        },
                    },
                ]),
            ]);

            const stats: Record<string, any> = {};
            for (const s of byStatus)
                stats[s._id] = {
                    count: s.count,
                    totalStudents: s.totalStudents,
                };

            res.status(200).json({ success: true, data: all, stats });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
