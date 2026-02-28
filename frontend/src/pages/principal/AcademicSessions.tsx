import { useState } from "react";
import {
    Breadcrumbs, Link, Typography, Button, Chip, Skeleton, Drawer,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
    Select, MenuItem, FormControl, InputLabel, LinearProgress,
} from "@mui/material";
import {
    ChevronRight, Plus, Lock, LockOpen, ArrowUpCircle, UserCheck,
    Calendar, Users, BookOpen, TrendingUp, AlertCircle,
} from "lucide-react";
import {
    useGetSessionsByDeptQuery,
    useGetSessionAnalyticsQuery,
    useCreateSessionMutation,
    useLockSessionMutation,
    useUnlockSessionMutation,
    useCloseEnrollmentMutation,
    useManualPromoteMutation,
    type AcademicSession,
} from "../../services/academicSession/academicSession.service";
import { useGetDepartmentsQuery } from "../../services/department/department.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<AcademicSession["status"], { label: string; color: string }> = {
    upcoming: { label: "Upcoming", color: "!bg-blue-50 !text-blue-700" },
    active: { label: "Active", color: "!bg-emerald-50 !text-emerald-700" },
    locked: { label: "Locked", color: "!bg-amber-50 !text-amber-700" },
    completed: { label: "Completed", color: "!bg-slate-100 !text-slate-500" },
};

function monthsUntil(dateStr: string): number {
    const now = new Date();
    const target = new Date(dateStr);
    return Math.max(
        0,
        (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()),
    );
}

// ─── New Intake Drawer ────────────────────────────────────────────────────────
const NewIntakeDrawer = ({
    open, deptId, onClose,
}: { open: boolean; deptId: string; onClose: () => void }) => {
    const currentYear = new Date().getFullYear();
    const [form, setForm] = useState({ startYear: currentYear, intakeCapacity: 60 });
    const [error, setError] = useState("");
    const [create, { isLoading }] = useCreateSessionMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await create({ deptId, ...form }).unwrap();
            onClose();
        } catch (err: any) {
            setError(err?.data?.message ?? "Failed to create session.");
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{ sx: { width: 400, p: 4, bgcolor: "#FAFAFA" } }}>
            <h2 className="text-lg font-black text-slate-900 mb-1">Approve New Intake</h2>
            <p className="text-xs text-slate-500 mb-6">
                Creates a new 4-year / 8-semester academic cohort starting in the given year.
                This session begins in <strong>Semester 1</strong> with enrollment open.
            </p>

            {error && <Alert severity="error" className="mb-4 rounded-xl">{error}</Alert>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField
                    label="Intake Year" type="number" required size="small"
                    value={form.startYear}
                    onChange={(e) => setForm((p) => ({ ...p, startYear: parseInt(e.target.value) }))}
                    helperText={`Session will span ${form.startYear}–${form.startYear + 4}`}
                />
                <TextField
                    label="Intake Capacity" type="number" size="small"
                    value={form.intakeCapacity}
                    onChange={(e) => setForm((p) => ({ ...p, intakeCapacity: parseInt(e.target.value) }))}
                    helperText="Can be adjusted before enrollment closes"
                />
                <div className="flex gap-3 pt-4">
                    <Button fullWidth variant="outlined" onClick={onClose}
                        className="!border-slate-200 !text-slate-600 !normal-case !font-bold !rounded-xl">
                        Cancel
                    </Button>
                    <Button fullWidth type="submit" variant="contained" disabled={isLoading}
                        className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl">
                        {isLoading ? "Creating…" : "Approve Intake"}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

// ─── Promote Dialog ───────────────────────────────────────────────────────────
const PromoteDialog = ({
    open, session, onClose,
}: { open: boolean; session: AcademicSession | null; onClose: () => void }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [promote, { isLoading }] = useManualPromoteMutation();

    const deptId = typeof session?.department === "string"
        ? session.department
        : session?.department?._id ?? "";

    const handlePromote = async () => {
        if (!session || !reason.trim()) return;
        setError("");
        try {
            await promote({ deptId, id: session._id, reason }).unwrap();
            setReason("");
            onClose();
        } catch (err: any) {
            setError(err?.data?.message ?? "Promotion failed.");
        }
    };

    const nextSem = (session?.currentSemester ?? 0) + 1;
    const willComplete = session?.currentSemester === 8;

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 420 } }}>
            <DialogTitle className="font-black text-slate-900">
                {willComplete ? "Graduate Cohort" : `Promote to Semester ${nextSem}`}
            </DialogTitle>
            <DialogContent className="space-y-3">
                {willComplete && (
                    <Alert severity="warning" className="rounded-xl">
                        This will mark the session as <strong>Completed</strong> and graduate all enrolled students.
                    </Alert>
                )}
                <p className="text-sm text-slate-600">
                    Session: <strong>{session?.startYear}–{session?.endYear}</strong> · Currently Semester <strong>{session?.currentSemester}</strong>
                </p>
                {error && <Alert severity="error" className="rounded-xl">{error}</Alert>}
                <TextField
                    fullWidth multiline rows={2} size="small"
                    label="Reason / Notes (required)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. End-of-semester exams completed successfully"
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} className="!text-slate-500 !font-bold !normal-case">Cancel</Button>
                <Button
                    onClick={handlePromote}
                    disabled={!reason.trim() || isLoading}
                    variant="contained"
                    color={willComplete ? "warning" : "primary"}
                    className="!font-bold !normal-case !rounded-xl">
                    {isLoading ? "Processing…" : willComplete ? "Graduate Cohort" : `Promote to Sem ${nextSem}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Session Card ─────────────────────────────────────────────────────────────
const SessionCard = ({
    session, deptId, onPromote,
}: { session: AcademicSession; deptId: string; onPromote: (s: AcademicSession) => void }) => {
    const [lock] = useLockSessionMutation();
    const [unlock] = useUnlockSessionMutation();
    const [closeEnrollment] = useCloseEnrollmentMutation();

    const months = monthsUntil(session.nextPromotionDate);
    const semPct = (session.currentSemester / 8) * 100;
    const { label, color } = STATUS_MAP[session.status];
    const deptName = typeof session.department === "object" ? session.department.name : "";

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-black text-slate-900 text-lg leading-tight">
                        {session.startYear}–{session.endYear}
                    </p>
                    {deptName && <p className="text-xs text-slate-400 font-medium mt-0.5">{deptName}</p>}
                </div>
                <Chip label={label} size="small" className={`!text-[10px] !font-black !uppercase ${color}`} />
            </div>

            {/* Semester progress */}
            <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Semester {session.currentSemester} of 8</span>
                    <span>{Math.round(semPct)}%</span>
                </div>
                <LinearProgress
                    variant="determinate"
                    value={semPct}
                    sx={{
                        height: 8, borderRadius: 99,
                        bgcolor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                            bgcolor: session.status === "completed" ? "#94a3b8"
                                : session.status === "locked" ? "#f59e0b"
                                    : "#1e293b",
                            borderRadius: 99,
                        },
                    }}
                />
                {/* Semester pip labels */}
                <div className="flex justify-between mt-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} className={`text-[9px] font-black ${i < session.currentSemester ? "text-slate-700" : "text-slate-300"}`}>
                            S{i + 1}
                        </span>
                    ))}
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2">
                    <p className="font-black text-slate-900 text-sm">{session.totalEnrolledStudents}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Enrolled</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                    <p className="font-black text-slate-900 text-sm">{session.intakeCapacity}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Capacity</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                    <p className={`font-black text-sm ${months <= 1 ? "text-rose-600" : "text-slate-900"}`}>
                        {session.status === "completed" ? "—" : `${months}mo`}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Next Promo</p>
                </div>
            </div>

            {/* Enrollment open banner */}
            {session.enrollmentOpen && session.status !== "completed" && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-xl px-3 py-2">
                    <AlertCircle size={14} /> Enrollment is open
                </div>
            )}

            {/* Actions */}
            {session.status !== "completed" && (
                <div className="flex flex-wrap gap-2">
                    {session.enrollmentOpen && (
                        <Button size="small" variant="outlined"
                            startIcon={<UserCheck size={13} />}
                            onClick={() => closeEnrollment({ deptId, id: session._id })}
                            className="!border-slate-200 !text-slate-600 !normal-case !font-bold !text-[11px] !rounded-xl">
                            Close Enrollment
                        </Button>
                    )}
                    {session.status === "active" && (
                        <Button size="small" variant="outlined"
                            startIcon={<ArrowUpCircle size={13} />}
                            onClick={() => onPromote(session)}
                            className="!border-indigo-200 !text-indigo-600 !normal-case !font-bold !text-[11px] !rounded-xl">
                            {session.currentSemester < 8 ? `Promote → Sem ${session.currentSemester + 1}` : "Graduate Cohort"}
                        </Button>
                    )}
                    {session.status === "locked" ? (
                        <Button size="small" variant="outlined"
                            startIcon={<LockOpen size={13} />}
                            onClick={() => unlock({ deptId, id: session._id })}
                            className="!border-amber-200 !text-amber-600 !normal-case !font-bold !text-[11px] !rounded-xl">
                            Unlock
                        </Button>
                    ) : (
                        <Button size="small" variant="outlined"
                            startIcon={<Lock size={13} />}
                            onClick={() => lock({ deptId, id: session._id })}
                            className="!border-slate-200 !text-slate-500 !normal-case !font-bold !text-[11px] !rounded-xl">
                            Lock
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AcademicSessions = () => {
    const [selectedDept, setSelectedDept] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [promoteSession, setPromoteSession] = useState<AcademicSession | null>(null);

    const { data: deptData, isLoading: loadingDepts } = useGetDepartmentsQuery();
    const { data: sessionData, isLoading: loadingSessions } = useGetSessionsByDeptQuery(
        { deptId: selectedDept },
        { skip: !selectedDept },
    );
    const { data: analyticsData } = useGetSessionAnalyticsQuery();

    const departments = deptData?.data ?? [];
    const sessions = sessionData?.data ?? [];
    const stats = analyticsData?.stats ?? {};

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div>
                        <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                            <Link underline="hover" href="/principal/dashboard"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Principal
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Academic Sessions
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">Academic Sessions</h1>
                    </div>
                    {selectedDept && (
                        <Button variant="contained" startIcon={<Plus size={16} />}
                            onClick={() => setDrawerOpen(true)}
                            className="!bg-slate-900 !text-white !normal-case !font-black !text-xs !rounded-xl !shadow-none">
                            Approve New Intake
                        </Button>
                    )}
                </div>
            </header>

            <main className="p-8 space-y-6">
                {/* Institute Analytics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Active Sessions", value: stats.active?.count ?? 0, icon: <TrendingUp size={20} />, color: "text-emerald-600 bg-emerald-50" },
                        { label: "Upcoming Sessions", value: stats.upcoming?.count ?? 0, icon: <Calendar size={20} />, color: "text-blue-600 bg-blue-50" },
                        { label: "Completed Sessions", value: stats.completed?.count ?? 0, icon: <BookOpen size={20} />, color: "text-slate-600 bg-slate-100" },
                        { label: "Total Enrolled", value: (stats.active?.totalStudents ?? 0) + (stats.upcoming?.totalStudents ?? 0), icon: <Users size={20} />, color: "text-indigo-600 bg-indigo-50" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                {icon}
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">{value}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Department Selector */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                        Select Department to View Sessions
                    </h2>
                    <FormControl size="small" sx={{ minWidth: 300 }}>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={selectedDept}
                            label="Department"
                            onChange={(e) => setSelectedDept(e.target.value)}
                            sx={{ borderRadius: "12px" }}>
                            {loadingDepts ? (
                                <MenuItem disabled>Loading…</MenuItem>
                            ) : departments.map((d) => (
                                <MenuItem key={d._id} value={d._id}>
                                    {d.name} <span className="ml-2 text-slate-400 text-xs font-bold">{d.code}</span>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                {/* Session Cards */}
                {selectedDept && (
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                            {departments.find((d) => d._id === selectedDept)?.name} — Academic Cohorts
                        </h2>

                        {loadingSessions ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} height={310} variant="rectangular" sx={{ borderRadius: 3 }} />
                                ))}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center">
                                <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="font-black text-slate-600">No sessions yet for this department</p>
                                <p className="text-sm text-slate-400 mt-1 mb-4">Approve a new student intake to create the first cohort.</p>
                                <Button variant="contained" startIcon={<Plus size={16} />}
                                    onClick={() => setDrawerOpen(true)}
                                    className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl !shadow-none">
                                    Approve First Intake
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {sessions.map((s) => (
                                    <SessionCard
                                        key={s._id}
                                        session={s}
                                        deptId={selectedDept}
                                        onPromote={setPromoteSession}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!selectedDept && (
                    <div className="text-center py-16 text-slate-400">
                        <Calendar size={40} className="mx-auto mb-3 text-slate-200" />
                        <p className="font-bold">Select a department above to manage its academic sessions.</p>
                    </div>
                )}
            </main>

            {/* New Intake Drawer */}
            <NewIntakeDrawer
                open={drawerOpen}
                deptId={selectedDept}
                onClose={() => setDrawerOpen(false)}
            />

            {/* Promote Dialog */}
            <PromoteDialog
                open={!!promoteSession}
                session={promoteSession}
                onClose={() => setPromoteSession(null)}
            />
        </div>
    );
};

export default AcademicSessions;
