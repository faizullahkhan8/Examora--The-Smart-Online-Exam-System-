import { Schema, model } from "mongoose";
import type { IAttendance } from "../types/index.ts";

const attendanceRecordSchema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: "User", required: true },
        present: { type: Boolean, required: true },
    },
    { _id: false },
);

const attendanceSchema = new Schema<IAttendance>(
    {
        subject: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },
        teacher: { type: Schema.Types.ObjectId, ref: "User", required: true },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },
        date: { type: Date, required: true },
        semester: { type: Number, required: true, min: 1, max: 8 },
        records: [attendanceRecordSchema],
    },
    { timestamps: true },
);

// One attendance sheet per subject per date
attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });
attendanceSchema.index({ department: 1, semester: 1 });

const AttendanceModel = model<IAttendance>("Attendance", attendanceSchema);
export default AttendanceModel;
