import mongoose from "mongoose";

// ─── Participant sub-document ─────────────────────────────────────────────────
const participantSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        acknowledgement: {
            type: String,
            enum: ["pending", "attending", "not_attending"],
            default: "pending",
        },
        acknowledgementReason: {
            type: String,
            trim: true,
            default: "",
        },
        attendanceStatus: {
            type: String,
            enum: ["present", "absent", "excused", null],
            default: null,
        },
    },
    { _id: false },
);

// ─── Bulk group sub-document ──────────────────────────────────────────────────
const bulkGroupSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: [
                "all_faculty",
                "all_students",
                "all_staff",
                "department",
                "semester",
                "course",
                "role",
            ],
        },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
        semester:   { type: Number },
        course:     { type: String, trim: true },
        role:       { type: String, trim: true },
        /** Generic sub-value: dept ID (department type), session ID (semester type), class string (course type), role key (role type) */
        subValue:     { type: String, trim: true },
        /** For semester-wise: the department whose sessions are being scoped */
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    },
    { _id: false },
);

// ─── Meeting schema ───────────────────────────────────────────────────────────
const meetingSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        date:      { type: Date, required: true },
        startTime: { type: String, required: true }, // "HH:mm"
        endTime:   { type: String, required: true }, // "HH:mm"

        locationType: {
            type: String,
            enum: ["physical", "online"],
            required: true,
            default: "physical",
        },
        location:    { type: String, trim: true, default: "" }, // room / hall
        meetingLink: { type: String, trim: true, default: "" }, // Zoom / Meet URL

        status: {
            type: String,
            enum: ["draft", "scheduled", "cancelled", "completed"],
            default: "draft",
        },

        participantMode: {
            type: String,
            enum: ["bulk", "individual", "single"],
            default: "individual",
        },
        bulkGroup: { type: bulkGroupSchema },

        participants: { type: [participantSchema], default: [] },

        notes: { type: String, trim: true, default: "" }, // meeting minutes

        attachments: [
            {
                name:       String,
                url:        String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true },
);

meetingSchema.index({ organizer: 1, status: 1 });
meetingSchema.index({ date: 1 });
meetingSchema.index({ "participants.user": 1, status: 1 });

export default mongoose.model("Meeting", meetingSchema);
