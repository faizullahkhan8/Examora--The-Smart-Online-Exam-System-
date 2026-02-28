import cron from "node-cron";
import mongoose from "mongoose";
import AcademicSessionModel from "../models/academicSession.model.ts";
import { promoteSemester } from "../controller/academicSession.controller.ts";

/**
 * Runs daily at 00:05.
 * Finds all active sessions whose nextPromotionDate has passed,
 * then calls the shared promoteSemester utility inside a transaction.
 *
 * Manual promotion (by HOD) and exam-triggered promotion use the same utility,
 * so all three paths share identical logic.
 */
export function startSessionPromotionJob() {
    cron.schedule("5 0 * * *", async () => {
        console.log("[CRON] Running academic session promotion check …");

        const now = new Date();
        const dueSessions = await AcademicSessionModel.find({
            status: "active",
            nextPromotionDate: { $lte: now },
        }).select("_id currentSemester");

        if (dueSessions.length === 0) {
            console.log("[CRON] No sessions due for promotion.");
            return;
        }

        for (const session of dueSessions) {
            const mongoSession = await mongoose.startSession();
            try {
                await mongoSession.withTransaction(async () => {
                    const result = await promoteSemester(
                        String(session._id),
                        mongoSession,
                    );
                    console.log(
                        result.completed
                            ? `[CRON] Session ${session._id} → COMPLETED (cohort graduated)`
                            : `[CRON] Session ${session._id} → Semester ${result.newSemester}`,
                    );
                });
            } catch (err: any) {
                console.error(
                    `[CRON] Failed to promote session ${session._id}:`,
                    err.message,
                );
            } finally {
                await mongoSession.endSession();
            }
        }
    });

    console.log(
        "[CRON] Academic session promotion job scheduled (daily @ 00:05).",
    );
}
