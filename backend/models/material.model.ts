import { Schema, model } from "mongoose";
import type { IMaterial } from "../types/index.ts";

const materialSchema = new Schema<IMaterial>(
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
        title: { type: String, required: true },
        type: {
            type: String,
            enum: ["pdf", "link", "note"],
            required: true,
        },
        content: { type: String, required: true }, // URL for pdf/link, text for note
        semester: { type: Number, required: true, min: 1, max: 8 },
    },
    { timestamps: true },
);

materialSchema.index({ subject: 1 });
materialSchema.index({ department: 1, semester: 1 });
materialSchema.index({ teacher: 1 });

const MaterialModel = model<IMaterial>("Material", materialSchema);
export default MaterialModel;
