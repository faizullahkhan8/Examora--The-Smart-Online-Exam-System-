import { Schema, model } from "mongoose";
import type { IExamPaper } from "../types/index.ts";

const examQuestionSchema = new Schema(
    {
        text: { type: String, required: true },
        marks: { type: Number, required: true, min: 1 },
        type: { type: String, enum: ["mcq", "short", "long"], required: true },
        options: [{ type: String }],
    },
    { _id: false },
);

const examPaperSchema = new Schema<IExamPaper>(
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
        session: {
            type: Schema.Types.ObjectId,
            ref: "AcademicSession",
            required: true,
        },
        semester: { type: Number, required: true, min: 1, max: 8 },
        title: { type: String, required: true },
        questions: [examQuestionSchema],
        totalMarks: { type: Number, required: true },
        duration: { type: Number, required: true }, // minutes
        status: {
            type: String,
            enum: ["draft", "submitted", "approved", "rejected"],
            default: "draft",
        },
        rejectionReason: { type: String },
    },
    { timestamps: true },
);

examPaperSchema.index({ teacher: 1 });
examPaperSchema.index({ subject: 1 });
examPaperSchema.index({ department: 1, status: 1 });

const ExamPaperModel = model<IExamPaper>("ExamPaper", examPaperSchema);
export default ExamPaperModel;
