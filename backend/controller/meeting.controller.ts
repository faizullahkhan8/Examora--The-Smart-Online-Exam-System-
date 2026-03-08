import type { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";

import { ErrorResponse } from "../middlewares/error.handler.ts";
import MeetingModel from "../models/meeting.model.ts";
import UserModel from "../models/user.model.ts";
import AcademicSessionModel from "../models/academicSession.model.ts";
import NotificationModel from "../models/notification.model.ts";

import {
    createMeetingValidation,
    updateMeetingValidation,
    updateStatusValidation,
    addParticipantsValidation,
    acknowledgeValidation,
    markAttendanceValidation,
} from "../validations/meeting.validations.ts";

const POPULATE_ORGANIZER = "firstName lastName email role";
const POPULATE_USER = "firstName lastName email role department";

// ─── Helper: resolve bulk group to user IDs ────────────────────────────────────
async function resolveBulkParticipants(bulkGroup: any): Promise<string[]> {
    const filter: Record<string, any> = { isActive: true };

    switch (bulkGroup.type) {
        case "all_faculty":
            filter.role = "teacher";
            break;
        case "all_students":
            filter.role = "student";
            break;
        case "all_staff":
            filter.role = { $in: ["hod", "teacher", "principal"] };
            break;

        case "department": {
            // subValue = department ID (new flow), fallback to legacy department field
            const deptId = bulkGroup.subValue || bulkGroup.department;
            if (deptId) filter.department = deptId;
            break;
        }

        case "semester": {
            filter.role = "student";
            // New flow: subValue = session ID, departmentId = department
            if (bulkGroup.subValue) {
                const session = await AcademicSessionModel.findById(
                    bulkGroup.subValue,
                ).lean();
                if (session) {
                    filter.semester = session.currentSemester;
                    filter.department = session.department;
                }
            } else {
                // Legacy: semester number + optional departmentId / department
                if (bulkGroup.semester) filter.semester = bulkGroup.semester;
                if (bulkGroup.departmentId)
                    filter.department = bulkGroup.departmentId;
                else if (bulkGroup.department)
                    filter.department = bulkGroup.department;
            }
            break;
        }

        case "course": {
            filter.role = "student";
            // subValue = class/section string (new flow), fallback to legacy course
            const courseVal = bulkGroup.subValue || bulkGroup.course;
            if (courseVal) filter.course = courseVal;
            break;
        }

        case "role": {
            // subValue = role key (new flow), fallback to legacy role
            const roleVal = bulkGroup.subValue || bulkGroup.role;
            if (roleVal) filter.role = roleVal;
            break;
        }

        default:
            break;
    }

    const users = await UserModel.find(filter).select("_id");
    return users.map((u) => String(u._id));
}

// ─── Helper: send notifications to participants ────────────────────────────────
async function sendMeetingNotifications(
    meeting: any,
    participantIds: string[],
    organizerName: string,
) {
    const notifications = participantIds.map((uid) => ({
        recipient: uid,
        type: "system",
        title: `Meeting Invitation: ${meeting.title}`,
        message: `${organizerName} has invited you to "${meeting.title}" on ${new Date(meeting.date).toDateString()} at ${meeting.startTime}.`,
        priority: "medium",
    }));

    if (notifications.length > 0) {
        await NotificationModel.insertMany(notifications).catch(() => {});
    }
}

// ─── GET /meetings ─────────────────────────────────────────────────────────────
export const getMeetings = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.session.user?.id;
            const { tab = "participant", status } = req.query as {
                tab?: "organizer" | "participant";
                status?: string;
            };

            const filter: Record<string, any> = {};

            if (tab === "organizer") {
                filter.organizer = userId;
            } else {
                filter["participants.user"] = userId;
            }

            if (status && status !== "all") {
                filter.status = status;
            }

            const meetings = await MeetingModel.find(filter)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER)
                .sort({ date: -1 })
                .lean();

            res.status(200).json({ success: true, data: meetings });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── POST /meetings ────────────────────────────────────────────────────────────
export const createMeeting = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.session.user?.id;
            const userRole = req.session.user?.role;

            if (
                !["admin", "principal", "hod", "teacher"].includes(
                    userRole ?? "",
                )
            ) {
                return next(
                    new ErrorResponse("Not authorized to create meetings", 403),
                );
            }

            const validation = createMeetingValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const data = validation.data;
            let participantIds: string[] = [];

            if (data.participantMode === "bulk" && data.bulkGroup) {
                participantIds = await resolveBulkParticipants(data.bulkGroup);
            } else if (data.participantMode === "individual") {
                participantIds = (data.participants ?? []).map(String);
            }
            // Remove duplicates and the organizer themselves
            participantIds = [...new Set(participantIds)].filter(
                (id) => id !== String(userId),
            );

            const participants = participantIds.map((uid) => ({
                user: uid,
                acknowledgement: "pending",
                acknowledgementReason: "",
                attendanceStatus: null,
            }));

            const meeting = await MeetingModel.create({
                title: data.title,
                description: data.description,
                organizer: userId,
                date: new Date(data.date),
                startTime: data.startTime,
                endTime: data.endTime,
                locationType: data.locationType,
                location: data.location,
                meetingLink: data.meetingLink,
                status: data.status,
                participantMode: data.participantMode,
                bulkGroup: data.bulkGroup,
                participants,
            });

            // Send notifications if publishing (not draft)
            if (data.status === "scheduled" && participantIds.length > 0) {
                const organizer =
                    await UserModel.findById(userId).select(
                        "firstName lastName",
                    );
                const organizerName = organizer
                    ? `${organizer.firstName} ${organizer.lastName}`
                    : "Organizer";
                await sendMeetingNotifications(
                    meeting,
                    participantIds,
                    organizerName,
                );
            }

            const populated = await MeetingModel.findById(meeting._id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            res.status(201).json({
                success: true,
                message: "Meeting created",
                data: populated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── GET /meetings/:id ────────────────────────────────────────────────────────
export const getMeetingById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }

            res.status(200).json({ success: true, data: meeting });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── PATCH /meetings/:id ──────────────────────────────────────────────────────
export const updateMeeting = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }
            if (String(meeting.organizer) !== String(userId)) {
                return next(
                    new ErrorResponse(
                        "Only the organizer can edit this meeting",
                        403,
                    ),
                );
            }

            const validation = updateMeetingValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            Object.assign(meeting, validation.data);
            await meeting.save();

            const updated = await MeetingModel.findById(id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            res.status(200).json({
                success: true,
                message: "Meeting updated",
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── PATCH /meetings/:id/status ───────────────────────────────────────────────
export const updateMeetingStatus = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }
            if (String(meeting.organizer) !== String(userId)) {
                return next(
                    new ErrorResponse(
                        "Only the organizer can change status",
                        403,
                    ),
                );
            }

            const validation = updateStatusValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const prevStatus = meeting.status;
            meeting.status = validation.data.status;
            await meeting.save();

            // Notify participants when moving from draft → scheduled
            if (
                prevStatus === "draft" &&
                validation.data.status === "scheduled"
            ) {
                const participantIds = meeting.participants.map((p: any) =>
                    String(p.user),
                );
                if (participantIds.length > 0) {
                    const organizer =
                        await UserModel.findById(userId).select(
                            "firstName lastName",
                        );
                    const organizerName = organizer
                        ? `${organizer.firstName} ${organizer.lastName}`
                        : "Organizer";
                    await sendMeetingNotifications(
                        meeting,
                        participantIds,
                        organizerName,
                    );
                }
            }

            const updated = await MeetingModel.findById(id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            res.status(200).json({
                success: true,
                message: "Status updated",
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── PATCH /meetings/:id/participants ─────────────────────────────────────────
export const addParticipants = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }
            if (String(meeting.organizer) !== String(userId)) {
                return next(
                    new ErrorResponse(
                        "Only the organizer can add participants",
                        403,
                    ),
                );
            }

            const validation = addParticipantsValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const existing = new Set(
                meeting.participants.map((p: any) => String(p.user)),
            );
            const newIds = validation.data.participants.filter(
                (id) => !existing.has(id),
            );

            newIds.forEach((uid) => {
                (meeting.participants as any[]).push({
                    user: uid,
                    acknowledgement: "pending",
                    acknowledgementReason: "",
                    attendanceStatus: null,
                });
            });

            await meeting.save();

            // Send notifications to newly added participants
            if (newIds.length > 0 && meeting.status === "scheduled") {
                const organizer =
                    await UserModel.findById(userId).select(
                        "firstName lastName",
                    );
                const organizerName = organizer
                    ? `${organizer.firstName} ${organizer.lastName}`
                    : "Organizer";
                await sendMeetingNotifications(meeting, newIds, organizerName);
            }

            const updated = await MeetingModel.findById(id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            res.status(200).json({
                success: true,
                message: "Participants added",
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE /meetings/:id/participants/:uid ───────────────────────────────────
export const removeParticipant = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, uid } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }
            if (String(meeting.organizer) !== String(userId)) {
                return next(
                    new ErrorResponse(
                        "Only the organizer can remove participants",
                        403,
                    ),
                );
            }

            meeting.participants = (meeting.participants as any[]).filter(
                (p) => String(p.user) !== String(uid),
            ) as any;
            await meeting.save();

            const updated = await MeetingModel.findById(id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            res.status(200).json({
                success: true,
                message: "Participant removed",
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── PATCH /meetings/:id/acknowledge ─────────────────────────────────────────
export const acknowledgeMeeting = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const validation = acknowledgeValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }

            const participantEntry = (meeting.participants as any[]).find(
                (p) => String(p.user) === String(userId),
            );
            if (!participantEntry) {
                return next(
                    new ErrorResponse(
                        "You are not a participant of this meeting",
                        403,
                    ),
                );
            }

            participantEntry.acknowledgement = validation.data.acknowledgement;
            participantEntry.acknowledgementReason =
                validation.data.acknowledgementReason ?? "";
            await meeting.save();

            res.status(200).json({
                success: true,
                message: "Acknowledgement saved",
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── PATCH /meetings/:id/attendance ──────────────────────────────────────────
export const markAttendance = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }
            if (String(meeting.organizer) !== String(userId)) {
                return next(
                    new ErrorResponse(
                        "Only the organizer can mark attendance",
                        403,
                    ),
                );
            }

            const validation = markAttendanceValidation.safeParse(req.body);
            if (!validation.success) {
                return next(new ErrorResponse(validation.error.message, 400));
            }

            const attendanceMap = new Map(
                validation.data.attendance.map((a) => [a.userId, a.status]),
            );

            (meeting.participants as any[]).forEach((p) => {
                const status = attendanceMap.get(String(p.user));
                if (status) p.attendanceStatus = status;
            });

            await meeting.save();

            const updated = await MeetingModel.findById(id)
                .populate("organizer", POPULATE_ORGANIZER)
                .populate("participants.user", POPULATE_USER);

            res.status(200).json({
                success: true,
                message: "Attendance marked",
                data: updated,
            });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);

// ─── DELETE /meetings/:id ─────────────────────────────────────────────────────
export const deleteMeeting = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.session.user?.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new ErrorResponse("Invalid meeting ID", 400));
            }

            const meeting = await MeetingModel.findById(id);
            if (!meeting) {
                return next(new ErrorResponse("Meeting not found", 404));
            }
            if (
                String(meeting.organizer) !== String(userId) &&
                req.session.user?.role !== "admin"
            ) {
                return next(
                    new ErrorResponse(
                        "Not authorized to delete this meeting",
                        403,
                    ),
                );
            }

            await MeetingModel.findByIdAndDelete(id);

            res.status(200).json({ success: true, message: "Meeting deleted" });
        } catch (error: any) {
            return next(new ErrorResponse(error.message, 500));
        }
    },
);
