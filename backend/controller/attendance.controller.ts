import expressAsyncHandler from "express-async-handler";
import type { Request, Response, NextFunction } from "express";
import AttendanceModel from "../models/attendance.model.ts";
import SubjectModel from "../models/subject.model.ts";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/error.handler.ts";

// ─── MARK / UPSERT ATTENDANCE ─────────────────────────────────────────────────
export const markAttendance = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const teacherId = req.session.user?.id;
            const { subjectId, date, records } = req.body;
            // records: [{ student: ObjectId, present: boolean }]
            if (!subjectId || !date || !Array.isArray(records))
                return next(
                    new ErrorResponse(
                        "subjectId, date and records are required",
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

            const attendanceDate = new Date(date);
            attendanceDate.setHours(0, 0, 0, 0);

            const attendance = await AttendanceModel.findOneAndUpdate(
                { subject: subjectId, date: attendanceDate },
                {
                    $set: {
                        teacher: teacherId,
                        department: subject.department,
                        semester: subject.semester,
                        records,
                    },
                },
                { upsert: true, new: true },
            );

            res.status(200).json({
                success: true,
                message: "Attendance saved",
                data: attendance,
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── GET ATTENDANCE BY SUBJECT ────────────────────────────────────────────────
export const getAttendanceBySubject = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { subjectId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(subjectId))
                return next(new ErrorResponse("Invalid subject ID", 400));

            const records = await AttendanceModel.find({ subject: subjectId })
                .populate("records.student", "firstName lastName email")
                .sort({ date: -1 })
                .lean();

            res.status(200).json({ success: true, data: records });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);

// ─── GET MY ATTENDANCE (student) ──────────────────────────────────────────────
export const getMyAttendance = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const studentId = req.session.user?.id;
            const { subjectId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(subjectId))
                return next(new ErrorResponse("Invalid subject ID", 400));

            const allRecords = await AttendanceModel.find({
                subject: subjectId,
            })
                .sort({ date: 1 })
                .lean();
            const myRecords = allRecords.map((a) => ({
                date: a.date,
                present: a.records.some(
                    (r) => String(r.student) === String(studentId) && r.present,
                ),
            }));
            const total = myRecords.length;
            const attended = myRecords.filter((r) => r.present).length;

            res.status(200).json({
                success: true,
                data: {
                    records: myRecords,
                    total,
                    attended,
                    percentage: total
                        ? Math.round((attended / total) * 100)
                        : 0,
                },
            });
        } catch (e: any) {
            next(new ErrorResponse(e.message, 500));
        }
    },
);
