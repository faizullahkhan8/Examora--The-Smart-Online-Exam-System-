import { Router } from "express";
import {
    getMeetings,
    createMeeting,
    getMeetingById,
    updateMeeting,
    updateMeetingStatus,
    addParticipants,
    removeParticipant,
    acknowledgeMeeting,
    markAttendance,
    deleteMeeting,
} from "../controller/meeting.controller.ts";
import { isAuthenticated } from "../middlewares/auth.middleware.ts";

const router = Router();
router.use(isAuthenticated);

router.get("/",    getMeetings);
router.post("/",   createMeeting);

router.get("/:id",           getMeetingById);
router.patch("/:id",         updateMeeting);
router.delete("/:id",        deleteMeeting);
router.patch("/:id/status",  updateMeetingStatus);

router.patch("/:id/participants",         addParticipants);
router.delete("/:id/participants/:uid",   removeParticipant);

router.patch("/:id/acknowledge", acknowledgeMeeting);
router.patch("/:id/attendance",  markAttendance);

export default router;
