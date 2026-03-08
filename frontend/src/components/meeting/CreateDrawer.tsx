import React, { useState, useEffect, useMemo } from "react";
import {
    Button, IconButton, Drawer,
    TextField, CircularProgress, Avatar,
    MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import {
    Plus, Search, Calendar, Clock, MapPin,
    Users, Check, ChevronRight, ChevronLeft,
    AlertCircle, UserCheck, Wifi, MapPinned, X, CheckCircle,
} from "lucide-react";
import {
    useCreateMeetingMutation,
    useUpdateMeetingMutation,
    type Meeting,
} from "../../services/meeting/meeting.service";
import { useGetAllUsersQuery } from "../../services/user/user.service";
import { useGetDepartmentsQuery } from "../../services/department/department.service";
import { useGetSessionsByDeptQuery } from "../../services/academicSession/academicSession.service";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
    tfSx, btnSx, BULK_GROUPS, EMPTY_FORM, type CreateForm,
} from "./meetingConstants";

// ─── types ────────────────────────────────────────────────────────────────────
interface CreateDrawerProps {
    open: boolean;
    editing?: Meeting | null;
    onClose: () => void;
}

// ─── role options for bulk "role-based" sub-filter ───────────────────────────
const ROLE_OPTIONS = [
    { value: "hod",     label: "Department Heads (HODs)" },
    { value: "teacher", label: "Faculty / Teachers" },
    { value: "student", label: "Students" },
];

// ─── semester options ─────────────────────────────────────────────────────────
const SEMESTER_OPTIONS = [
    { value: "1st",   label: "1st Semester" },
    { value: "2nd",   label: "2nd Semester" },
    { value: "3rd",   label: "3rd Semester" },
    { value: "4th",   label: "4th Semester" },
    { value: "5th",   label: "5th Semester" },
    { value: "6th",   label: "6th Semester" },
    { value: "7th",   label: "7th Semester" },
    { value: "8th",   label: "8th Semester" },
];

// ─── groups that need a sub-value ────────────────────────────────────────────
const NEEDS_SUB = ["department", "semester", "course", "role"];

// ─── helper to map bulk group type → role filter for preview ─────────────────
function bulkGroupToRole(groupType: string): string | undefined {
    if (groupType === "all_faculty") return "teacher";
    if (groupType === "all_students") return "student";
    if (groupType === "all_staff") return undefined; // all
    return undefined; // department / semester / course — needs sub-filters
}

const CreateDrawer: React.FC<CreateDrawerProps> = ({ open, editing, onClose }) => {
    const auth = useSelector((s: RootState) => s.auth);
    const instituteId = (auth as any)?.institute ?? "";

    const [step, setStep] = useState(0);
    const [form, setForm] = useState<CreateForm>({ ...EMPTY_FORM });
    const [participantSearch, setParticipantSearch] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [singleSearch, setSingleSearch] = useState("");
    const [singleSelected, setSingleSelected] = useState<string | null>(null);
    // For Semester Wise: department picker before session picker
    const [bulkDeptId, setBulkDeptId] = useState<string>("");

    const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();
    const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingMutation();
    const isBusy = isCreating || isUpdating;

    // ── Fetch departments for sub-select (runs when bulk+department OR bulk+semester selected) ──
    const { data: deptData, isFetching: isFetchingDepts } = useGetDepartmentsQuery(
        { isActive: true },
        { skip: form.participantMode !== "bulk" || !['department', 'semester'].includes(form.bulkGroupType) },
    );

    // ── Fetch sessions for semester-wise second dropdown ───────────────────────────
    const { data: sessionsData, isFetching: isFetchingSessions } = useGetSessionsByDeptQuery(
        { deptId: bulkDeptId },
        { skip: form.participantMode !== "bulk" || form.bulkGroupType !== "semester" || !bulkDeptId },
    );
    // Only show active/locked sessions (not completed/upcoming with no students)
    const activeSessions = (sessionsData?.data ?? []).filter(s =>
        s.status === "active" || s.status === "locked"
    );

    // ── Live user fetching for individual mode ─────────────────────────────────
    const individualQueryArg = useMemo(() => ({
        institute: instituteId,
        search: participantSearch || undefined,
        limit: 50,
    }), [instituteId, participantSearch]);

    const { data: individualUsersData, isFetching: isFetchingIndividual } =
        useGetAllUsersQuery(
            step === 1 && form.participantMode === "individual" ? individualQueryArg : undefined,
            { skip: step !== 1 || form.participantMode !== "individual" },
        );

    // ── Live user fetching for single mode ────────────────────────────────────
    const singleQueryArg = useMemo(() => ({
        institute: instituteId,
        search: singleSearch || undefined,
        limit: 50,
    }), [instituteId, singleSearch]);

    const { data: singleUsersData, isFetching: isFetchingSingle } =
        useGetAllUsersQuery(
            step === 1 && form.participantMode === "single" ? singleQueryArg : undefined,
            { skip: step !== 1 || form.participantMode !== "single" },
        );

    // ── Bulk preview: fetch count of users in the selected group ───────────────
    const bulkRole = bulkGroupToRole(form.bulkGroupType);
    const bulkQueryArg = useMemo(() => ({
        institute: instituteId,
        ...(bulkRole ? { role: bulkRole } : {}),
        limit: 1, // we only need `total` from pagination
    }), [instituteId, bulkRole, form.bulkGroupType]);

    const { data: bulkPreviewData, isFetching: isFetchingBulk } =
        useGetAllUsersQuery(
            step === 1 && form.participantMode === "bulk" && form.bulkGroupType !== "department" && form.bulkGroupType !== "semester" && form.bulkGroupType !== "course"
                ? bulkQueryArg
                : undefined,
            {
                skip: step !== 1 || form.participantMode !== "bulk" ||
                    ["department", "semester", "course"].includes(form.bulkGroupType),
            },
        );

    const bulkPreviewCount = bulkPreviewData?.pagination?.total;

    // ── Form sync with editing ─────────────────────────────────────────────────
    useEffect(() => {
        if (open) {
            if (editing) {
                setForm({
                    title: editing.title,
                    description: editing.description,
                    date: editing.date ? editing.date.split("T")[0] : "",
                    startTime: editing.startTime,
                    endTime: editing.endTime,
                    locationType: editing.locationType,
                    location: editing.location,
                    meetingLink: editing.meetingLink,
                    status: editing.status === "draft" ? "draft" : "scheduled",
                    participantMode: editing.participantMode,
                    bulkGroupType: editing.bulkGroup?.type ?? "all_faculty",
                    bulkSubValue:  editing.bulkGroup?.subValue ?? "",
                    participants: [],
                });
                setSelectedParticipants([]);
            } else {
                setForm({ ...EMPTY_FORM });
                setSelectedParticipants([]);
                setSingleSelected(null);
                setBulkDeptId("");
            }
            setStep(0);
            setParticipantSearch("");
            setSingleSearch("");
        }
    }, [open, editing]);

    const f = (k: keyof CreateForm, v: any) => setForm(p => ({ ...p, [k]: v }));

    const toggleParticipant = (userId: string) => {
        setSelectedParticipants(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId],
        );
    };

    const handleSubmit = async (submitStatus: "draft" | "scheduled") => {
        try {
            const payload: any = {
                title: form.title,
                description: form.description,
                date: form.date,
                startTime: form.startTime,
                endTime: form.endTime,
                locationType: form.locationType,
                location: form.location,
                meetingLink: form.meetingLink,
                status: submitStatus,
                participantMode: form.participantMode,
                participants: form.participantMode === "individual"
                    ? selectedParticipants
                    : form.participantMode === "single" && singleSelected
                        ? [singleSelected]
                        : form.participants,
                ...(form.participantMode === "bulk" ? {
                    bulkGroup: {
                        type: form.bulkGroupType,
                        ...(NEEDS_SUB.includes(form.bulkGroupType) && form.bulkSubValue
                            ? { subValue: form.bulkSubValue }
                            : {}),
                        // For semester mode, also pass the department so backend can scope the query
                        ...(form.bulkGroupType === "semester" && bulkDeptId
                            ? { departmentId: bulkDeptId }
                            : {}),
                    },
                } : {}),
            };

            if (editing) {
                await updateMeeting({ id: editing._id, ...payload }).unwrap();
            } else {
                await createMeeting(payload).unwrap();
            }
            onClose();
        } catch { /* handled globally */ }
    };

    const steps = ["Details", "Participants", "Review"];

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{ sx: { width: 500, bgcolor: "var(--bg-surface)", borderLeft: "1px solid var(--ui-border)" } }}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--ui-divider)] bg-[var(--bg-base)] shrink-0">
                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <IconButton size="small" onClick={() => setStep(s => s - 1)}
                                sx={{ color: "var(--text-secondary)", border: "1px solid var(--ui-border)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--bg-surface)" } }}>
                                <ChevronLeft size={16} />
                            </IconButton>
                        )}
                        <div>
                            <h2 className="text-lg font-black text-[var(--text-primary)]">
                                {editing ? "Edit Meeting" : "Schedule Meeting"}
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                                Step {step + 1} of {steps.length} — {steps[step]}
                            </p>
                        </div>
                    </div>
                    <IconButton onClick={onClose} size="small"
                        sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--bg-surface)" } }}>
                        <X size={18} />
                    </IconButton>
                </div>

                {/* Step indicators */}
                <div className="flex items-center gap-1 px-6 pt-5 shrink-0">
                    {steps.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${i === step ? "bg-[var(--brand-primary)] text-white" :
                                    i < step ? "bg-emerald-100 text-emerald-700" :
                                        "bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--ui-border)]"
                                }`}>
                                {i < step ? <Check size={12} /> : i + 1} {s}
                            </div>
                            {i < steps.length - 1 && <div className="h-px flex-1 bg-[var(--ui-divider)]" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">

                    {/* ── Step 0: Details ── */}
                    {step === 0 && (
                        <div className="flex flex-col gap-6">
                            <TextField fullWidth label="Meeting Title *" value={form.title}
                                onChange={e => f("title", e.target.value)} sx={tfSx} />
                            <TextField fullWidth label="Agenda / Description" multiline rows={3}
                                value={form.description} onChange={e => f("description", e.target.value)} sx={tfSx} />

                            <div className="grid grid-cols-3 gap-4">
                                <TextField fullWidth label="Date *" type="date" InputLabelProps={{ shrink: true }}
                                    value={form.date} onChange={e => f("date", e.target.value)} sx={tfSx} />
                                <TextField fullWidth label="Start *" type="time" InputLabelProps={{ shrink: true }}
                                    value={form.startTime} onChange={e => f("startTime", e.target.value)} sx={tfSx} />
                                <TextField fullWidth label="End *" type="time" InputLabelProps={{ shrink: true }}
                                    value={form.endTime} onChange={e => f("endTime", e.target.value)} sx={tfSx} />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Location Type</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["physical", "online"] as const).map(t => (
                                        <button key={t}
                                            onClick={() => f("locationType", t)}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${form.locationType === t
                                                    ? "border-[var(--brand-primary)] bg-[var(--brand-active)] text-[var(--brand-primary)]"
                                                    : "border-[var(--ui-border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]"
                                                }`}>
                                            {t === "physical" ? <MapPinned size={16} /> : <Wifi size={16} />}
                                            {t === "physical" ? "Physical Room" : "Online Link"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.locationType === "physical"
                                ? <TextField fullWidth label="Room / Hall" value={form.location}
                                    onChange={e => f("location", e.target.value)} sx={tfSx} />
                                : <TextField fullWidth label="Meeting Link (Zoom, Meet…)" type="url"
                                    value={form.meetingLink} onChange={e => f("meetingLink", e.target.value)} sx={tfSx} />
                            }
                        </div>
                    )}

                    {/* ── Step 1: Participants ── */}
                    {step === 1 && (
                        <>
                            <p className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Participant Mode</p>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {([
                                    { v: "bulk", label: "Bulk Group", icon: <Users size={18} /> },
                                    { v: "individual", label: "Multi-Select", icon: <UserCheck size={18} /> },
                                    { v: "single", label: "Single Add", icon: <Plus size={18} /> },
                                ] as const).map(({ v, label, icon }) => (
                                    <button key={v} onClick={() => f("participantMode", v)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${form.participantMode === v
                                                ? "border-[var(--brand-primary)] bg-[var(--brand-active)] text-[var(--brand-primary)]"
                                                : "border-[var(--ui-border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]"
                                            }`}>
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>

                            {/* Bulk mode */}
                            {form.participantMode === "bulk" && (
                                <div className="space-y-4">
                                    <FormControl fullWidth sx={tfSx}>
                                        <InputLabel>Group Type</InputLabel>
                                        <Select label="Group Type" value={form.bulkGroupType}
                                            onChange={e => {
                                                f("bulkGroupType", e.target.value);
                                                f("bulkSubValue", ""); // reset sub-value on group change
                                                setBulkDeptId("");    // reset dept selection too
                                            }}>
                                            {BULK_GROUPS.map(g => (
                                                <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* ── Sub-select: Department Wise ── */}
                                    {form.bulkGroupType === "department" && (
                                        <FormControl fullWidth sx={tfSx}>
                                            <InputLabel>Select Department</InputLabel>
                                            <Select label="Select Department" value={form.bulkSubValue}
                                                onChange={e => f("bulkSubValue", e.target.value)}
                                                startAdornment={isFetchingDepts
                                                    ? <CircularProgress size={14} sx={{ color: "var(--brand-primary)", mr: 1 }} />
                                                    : undefined
                                                }>
                                                {(deptData?.data ?? []).map(d => (
                                                    <MenuItem key={d._id} value={d._id}>
                                                        <span className="font-semibold">{d.name}</span>
                                                        <span className="text-xs text-[var(--text-secondary)] ml-2 font-mono">{d.code}</span>
                                                    </MenuItem>
                                                ))}
                                                {!isFetchingDepts && (deptData?.data ?? []).length === 0 && (
                                                    <MenuItem disabled>No departments found</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    )}

                                    {/* ── Sub-selects: Semester Wise (dept → session cascade) ── */}
                                    {form.bulkGroupType === "semester" && (
                                        <>
                                            {/* Step 1: Pick department */}
                                            <FormControl fullWidth sx={tfSx}>
                                                <InputLabel>Select Department</InputLabel>
                                                <Select label="Select Department" value={bulkDeptId}
                                                    onChange={e => {
                                                        setBulkDeptId(e.target.value);
                                                        f("bulkSubValue", ""); // reset session when dept changes
                                                    }}
                                                    startAdornment={isFetchingDepts
                                                        ? <CircularProgress size={14} sx={{ color: "var(--brand-primary)", mr: 1 }} />
                                                        : undefined
                                                    }>
                                                    {(deptData?.data ?? []).map(d => (
                                                        <MenuItem key={d._id} value={d._id}>
                                                            <span className="font-semibold">{d.name}</span>
                                                            <span className="text-xs text-[var(--text-secondary)] ml-2 font-mono">{d.code}</span>
                                                        </MenuItem>
                                                    ))}
                                                    {!isFetchingDepts && (deptData?.data ?? []).length === 0 && (
                                                        <MenuItem disabled>No departments found</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>

                                            {/* Step 2: Pick session (only when dept chosen) */}
                                            {bulkDeptId && (
                                                <FormControl fullWidth sx={tfSx}>
                                                    <InputLabel>Select Session / Semester</InputLabel>
                                                    <Select label="Select Session / Semester" value={form.bulkSubValue}
                                                        onChange={e => f("bulkSubValue", e.target.value)}
                                                        startAdornment={isFetchingSessions
                                                            ? <CircularProgress size={14} sx={{ color: "var(--brand-primary)", mr: 1 }} />
                                                            : undefined
                                                        }>
                                                        {activeSessions.map(s => (
                                                            <MenuItem key={s._id} value={s._id}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-sm">
                                                                        {s.startYear}–{s.endYear} &nbsp;·&nbsp; Semester {s.currentSemester}
                                                                    </span>
                                                                    <span className="text-[10px] text-[var(--text-secondary)] capitalize font-medium">
                                                                        {s.status} · {s.totalEnrolledStudents} students
                                                                    </span>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                        {!isFetchingSessions && activeSessions.length === 0 && (
                                                            <MenuItem disabled>
                                                                No active sessions in this department
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        </>
                                    )}

                                    {/* ── Sub-input: Course / Class Wise ── */}
                                    {form.bulkGroupType === "course" && (
                                        <TextField fullWidth label="Class / Section (e.g. BSCS-3A)"
                                            placeholder="BSCS-3A"
                                            value={form.bulkSubValue}
                                            onChange={e => f("bulkSubValue", e.target.value)}
                                            sx={tfSx} />
                                    )}

                                    {/* ── Sub-select: Role Based ── */}
                                    {form.bulkGroupType === "role" && (
                                        <FormControl fullWidth sx={tfSx}>
                                            <InputLabel>Select Role</InputLabel>
                                            <Select label="Select Role" value={form.bulkSubValue}
                                                onChange={e => f("bulkSubValue", e.target.value)}>
                                                {ROLE_OPTIONS.map(r => (
                                                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}

                                    {/* Live count preview */}
                                    {!["department", "semester", "course", "role"].includes(form.bulkGroupType) && (
                                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                            {isFetchingBulk
                                                ? <CircularProgress size={14} sx={{ color: "#059669" }} />
                                                : <Users size={14} className="text-emerald-600" />
                                            }
                                            <p className="text-xs text-emerald-800 font-semibold">
                                                {isFetchingBulk
                                                    ? "Counting matching users…"
                                                    : bulkPreviewCount !== undefined
                                                        ? `${bulkPreviewCount} user${bulkPreviewCount !== 1 ? "s" : ""} will be invited`
                                                        : "Resolving participant count…"
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                        <AlertCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                                            The system will automatically fetch all matching users when the meeting is published and notify them accordingly.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Individual / multi-select — live search */}
                            {form.participantMode === "individual" && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                        <input
                                            placeholder="Search users by name or email…"
                                            value={participantSearch}
                                            onChange={e => setParticipantSearch(e.target.value)}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--ui-border)] rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-all"
                                        />
                                        {isFetchingIndividual && (
                                            <CircularProgress size={14} sx={{ color: "var(--brand-primary)" }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2" />
                                        )}
                                    </div>

                                    {/* Selected badge strip */}
                                    {selectedParticipants.length > 0 && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                                                Selected ({selectedParticipants.length}):
                                            </span>
                                            {selectedParticipants.map(uid => {
                                                const u = individualUsersData?.data?.find(x => x._id === uid);
                                                return u ? (
                                                    <span key={uid}
                                                        className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-[var(--brand-active)] text-[var(--brand-primary)] border border-[var(--brand-primary)] rounded-md">
                                                        {u.firstName} {u.lastName}
                                                        <button onClick={() => toggleParticipant(uid)} className="ml-1 opacity-60 hover:opacity-100">
                                                            <X size={10} />
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    {/* User list */}
                                    <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {isFetchingIndividual && !individualUsersData?.data?.length ? (
                                            <div className="flex items-center justify-center py-8">
                                                <CircularProgress size={24} sx={{ color: "var(--brand-primary)" }} />
                                            </div>
                                        ) : (individualUsersData?.data ?? []).length === 0 ? (
                                            <div className="py-8 bg-[var(--bg-base)] border border-[var(--ui-border)] rounded-xl text-center">
                                                <p className="text-sm font-bold text-[var(--text-secondary)]">No users found</p>
                                                <p className="text-xs text-[var(--text-secondary)] mt-1">Try a different search term</p>
                                            </div>
                                        ) : (
                                            (individualUsersData?.data ?? []).map(user => {
                                                const selected = selectedParticipants.includes(user._id);
                                                return (
                                                    <div key={user._id}
                                                        onClick={() => toggleParticipant(user._id)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selected
                                                                ? "border-[var(--brand-primary)] bg-[var(--brand-active)]"
                                                                : "border-[var(--ui-border)] bg-[var(--bg-base)] hover:border-[var(--brand-primary)]"
                                                            }`}>
                                                        <Avatar sx={{ width: 32, height: 32, fontSize: "12px", fontWeight: 700 }}
                                                            className="bg-[var(--bg-sidebar)]! text-[var(--text-on-dark)]!">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </Avatar>
                                                        <div className="min-w-0 grow">
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                                                                {user.firstName} {user.lastName}
                                                            </p>
                                                            <p className="text-[10px] text-[var(--text-secondary)] font-medium capitalize truncate">
                                                                {user.role}{user.department?.name ? ` · ${user.department.name}` : ""}
                                                            </p>
                                                        </div>
                                                        {selected && <CheckCircle size={16} className="text-[var(--brand-primary)] shrink-0" />}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Single add — live search, pick exactly one */}
                            {form.participantMode === "single" && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                                        <input
                                            placeholder="Search to find a user…"
                                            value={singleSearch}
                                            onChange={e => setSingleSearch(e.target.value)}
                                            className="w-full bg-[var(--bg-base)] border border-[var(--ui-border)] rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none transition-all"
                                        />
                                        {isFetchingSingle && (
                                            <CircularProgress size={14} sx={{ color: "var(--brand-primary)" }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2" />
                                        )}
                                    </div>

                                    {/* Selected user pill */}
                                    {singleSelected && (() => {
                                        const u = singleUsersData?.data?.find(x => x._id === singleSelected);
                                        return u ? (
                                            <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--brand-primary)] bg-[var(--brand-active)]">
                                                <Avatar sx={{ width: 32, height: 32, fontSize: "12px", fontWeight: 700 }}
                                                    className="bg-[var(--bg-sidebar)]! text-[var(--text-on-dark)]!">
                                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                                </Avatar>
                                                <div className="min-w-0 grow">
                                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{u.firstName} {u.lastName}</p>
                                                    <p className="text-[10px] text-[var(--text-secondary)] font-medium capitalize">{u.role}{u.department?.name ? ` · ${u.department.name}` : ""}</p>
                                                </div>
                                                <CheckCircle size={16} className="text-[var(--brand-primary)] shrink-0" />
                                                <IconButton size="small" onClick={() => setSingleSelected(null)}
                                                    sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--status-danger)" } }}>
                                                    <X size={14} />
                                                </IconButton>
                                            </div>
                                        ) : null;
                                    })()}

                                    {/* User list */}
                                    <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                        {isFetchingSingle && !singleUsersData?.data?.length ? (
                                            <div className="flex items-center justify-center py-8">
                                                <CircularProgress size={24} sx={{ color: "var(--brand-primary)" }} />
                                            </div>
                                        ) : (singleUsersData?.data ?? []).length === 0 ? (
                                            <div className="py-8 bg-[var(--bg-base)] border border-[var(--ui-border)] rounded-xl text-center">
                                                <p className="text-sm font-bold text-[var(--text-secondary)]">No users found</p>
                                                <p className="text-xs text-[var(--text-secondary)] mt-1">Try a different search term</p>
                                            </div>
                                        ) : (
                                            (singleUsersData?.data ?? []).map(user => {
                                                const isChosen = singleSelected === user._id;
                                                return (
                                                    <div key={user._id}
                                                        onClick={() => setSingleSelected(isChosen ? null : user._id)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChosen
                                                                ? "border-[var(--brand-primary)] bg-[var(--brand-active)]"
                                                                : "border-[var(--ui-border)] bg-[var(--bg-base)] hover:border-[var(--brand-primary)]"
                                                            }`}>
                                                        <Avatar sx={{ width: 32, height: 32, fontSize: "12px", fontWeight: 700 }}
                                                            className="bg-[var(--bg-sidebar)]! text-[var(--text-on-dark)]!">
                                                            {user.firstName?.[0]}{user.lastName?.[0]}
                                                        </Avatar>
                                                        <div className="min-w-0 grow">
                                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.firstName} {user.lastName}</p>
                                                            <p className="text-[10px] text-[var(--text-secondary)] font-medium capitalize truncate">
                                                                {user.role}{user.department?.name ? ` · ${user.department.name}` : ""}
                                                            </p>
                                                        </div>
                                                        {/* radio circle */}
                                                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                                            isChosen ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-[var(--ui-border)]"
                                                        }`}>
                                                            {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Step 2: Review ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="p-5 rounded-xl bg-[var(--bg-base)] border border-[var(--ui-border)] space-y-4">
                                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Review Details</p>
                                <div>
                                    <p className="text-base font-black text-[var(--text-primary)]">{form.title}</p>
                                    {form.description && (
                                        <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">{form.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[var(--ui-divider)]">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                                            <Calendar size={14} /> {form.date || "—"}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                                            <Clock size={14} /> {form.startTime} – {form.endTime}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                                            {form.locationType === "online" ? <Wifi size={14} /> : <MapPin size={14} />}
                                            {form.locationType === "online" ? form.meetingLink || "Online" : form.location || "Physical"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 rounded-xl bg-[var(--bg-base)] border border-[var(--ui-border)]">
                                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-2">Participant Mode</p>
                                <p className="text-sm text-[var(--text-primary)] font-bold capitalize">
                                    {form.participantMode}
                                    {form.participantMode === "bulk" && (
                                        <span className="text-[var(--text-secondary)] font-medium">
                                            {" → "}{BULK_GROUPS.find(g => g.value === form.bulkGroupType)?.label}
                                            {form.bulkSubValue && (() => {
                                                // resolve human-readable sub-label
                                                let subLabel = form.bulkSubValue;
                                                if (form.bulkGroupType === "department") {
                                                    const dept = deptData?.data?.find(d => d._id === form.bulkSubValue);
                                                    if (dept) subLabel = dept.name;
                                                } else if (form.bulkGroupType === "semester") {
                                                    const deptName = deptData?.data?.find(d => d._id === bulkDeptId)?.name ?? "";
                                                    const sess = activeSessions.find(s => s._id === form.bulkSubValue);
                                                    if (sess) subLabel = `${deptName ? deptName + " · " : ""}${sess.startYear}–${sess.endYear} · Sem ${sess.currentSemester}`;
                                                } else if (form.bulkGroupType === "role") {
                                                    const r = ROLE_OPTIONS.find(r => r.value === form.bulkSubValue);
                                                    if (r) subLabel = r.label;
                                                }
                                                return <span className="text-[var(--brand-primary)] ml-1 font-bold">: {subLabel}</span>;
                                            })()}
                                            {bulkPreviewCount !== undefined && !["department", "semester", "course", "role"].includes(form.bulkGroupType) &&
                                                <span className="text-emerald-600 ml-2">({bulkPreviewCount} users)</span>
                                            }
                                        </span>
                                    )}
                                    {form.participantMode === "individual" && selectedParticipants.length > 0 && (
                                        <span className="text-[var(--text-secondary)] font-medium">
                                            {" — "}{selectedParticipants.length} selected
                                        </span>
                                    )}
                                    {form.participantMode === "single" && singleSelected && (() => {
                                        const u = singleUsersData?.data?.find(x => x._id === singleSelected);
                                        return u ? (
                                            <span className="text-[var(--text-secondary)] font-medium">
                                                {" — "}{u.firstName} {u.lastName}
                                            </span>
                                        ) : null;
                                    })()}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <Button fullWidth variant="outlined" disabled={isBusy}
                                    onClick={() => handleSubmit("draft")}
                                    sx={{ ...btnSx, borderColor: "var(--ui-border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                                    {isBusy ? <CircularProgress size={16} color="inherit" /> : "Save as Draft"}
                                </Button>
                                <Button fullWidth variant="contained" disabled={isBusy}
                                    onClick={() => handleSubmit("scheduled")}
                                    sx={{ ...btnSx, bgcolor: "var(--brand-primary)", "&:hover": { bgcolor: "var(--bg-sidebar)" } }}>
                                    {isBusy ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Publish & Notify"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer nav */}
                {step < 2 && (
                    <div className="flex gap-3 p-6 border-t border-[var(--ui-divider)] shrink-0 bg-[var(--bg-surface)]">
                        {step > 0 && (
                            <Button variant="outlined" startIcon={<ChevronLeft size={16} />}
                                onClick={() => setStep(s => s - 1)}
                                sx={{ ...btnSx, borderColor: "var(--ui-border)", color: "var(--text-secondary)", flex: 1, "&:hover": { borderColor: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={() => setStep(s => s + 1)}
                            variant="contained"
                            endIcon={<ChevronRight size={16} />}
                            disabled={step === 0 && !form.title}
                            sx={{ ...btnSx, bgcolor: "var(--brand-primary)", "&:hover": { bgcolor: "var(--bg-sidebar)" }, flex: 2 }}>
                            Next Step
                        </Button>
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default CreateDrawer;
