import React from "react";
import { CheckCircle, XCircle, Clock3 } from "lucide-react";

// ─── Shared styles ─────────────────────────────────────────────────────────────
export const tfSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px", bgcolor: "var(--bg-base)", color: "var(--text-primary)",
        fontSize: "14px", fontWeight: 500,
        "& fieldset": { borderColor: "var(--ui-border)" },
        "&:hover fieldset": { borderColor: "var(--brand-primary)" },
        "&.Mui-focused fieldset": { borderColor: "var(--brand-primary)" },
    },
    "& .MuiInputLabel-root": { color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-primary)" },
    "& .MuiSelect-icon": { color: "var(--text-secondary)" },
};

export const btnSx = {
    borderRadius: "8px",
    textTransform: "none" as const,
    fontWeight: 600,
    boxShadow: "none",
};

// ─── Formatters ─────────────────────────────────────────────────────────────────
export const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// ─── Status config ─────────────────────────────────────────────────────────────
export const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    draft:     { label: "Draft",     cls: "bg-amber-50 text-amber-600 border-amber-100" },
    scheduled: { label: "Scheduled", cls: "bg-blue-50 text-blue-600 border-blue-100" },
    completed: { label: "Completed", cls: "bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--ui-border)]" },
    cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-600 border-rose-100" },
};

// ─── Acknowledgement config ────────────────────────────────────────────────────
export const ACK_CFG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    attending:     { label: "Attending",     cls: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: <CheckCircle size={12} /> },
    not_attending: { label: "Not Attending", cls: "bg-rose-50 text-rose-600 border-rose-100",         icon: <XCircle size={12} /> },
    pending:       { label: "Pending",       cls: "bg-amber-50 text-amber-600 border-amber-100",       icon: <Clock3 size={12} /> },
};

// ─── Bulk groups ───────────────────────────────────────────────────────────────
export const BULK_GROUPS = [
    { value: "all_faculty",  label: "All Faculty" },
    { value: "all_students", label: "All Students" },
    { value: "all_staff",    label: "All Staff" },
    { value: "department",   label: "Department Wise" },
    { value: "semester",     label: "Semester Wise" },
    { value: "course",       label: "Course / Class Wise" },
    { value: "role",         label: "Role Based" },
];

// ─── Empty form ────────────────────────────────────────────────────────────────
export const EMPTY_FORM = {
    title: "", description: "", date: "", startTime: "", endTime: "",
    locationType: "physical" as "physical" | "online",
    location: "", meetingLink: "",
    status: "draft" as "draft" | "scheduled",
    participantMode: "bulk" as "bulk" | "individual" | "single",
    bulkGroupType: "all_faculty",
    bulkSubValue: "",  // e.g. department ID, semester label, role
    participants: [] as string[],
};

export type CreateForm = typeof EMPTY_FORM;
