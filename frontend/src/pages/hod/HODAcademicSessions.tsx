import { useState } from "react";
import { Button, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { CalendarDays, AlertTriangle, Play, Info } from "lucide-react";
import { toast } from "react-toastify";
import { useGetHODProfileQuery } from "../../services/hod/hod.service";
import {
    useGetSessionsByDeptQuery,
    useManualPromoteMutation,
    useCreateSessionMutation,
    useLockSessionMutation,
    useUnlockSessionMutation,
    useCloseEnrollmentMutation,
    type AcademicSession
} from "../../services/academicSession/academicSession.service";
import { Drawer } from "@mui/material";
import {
    Plus, LockOpen, Lock, UserCheck, ArrowUpCircle
} from "lucide-react";

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
            toast.success("New cohort approved successfully");
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

            {error && <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-xl text-sm font-bold border border-rose-200">{error}</div>}

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

const HODAcademicSessions = () => {
    const { data: profileData } = useGetHODProfileQuery();
    const deptId = profileData?.data?.department?._id ?? "";

    const { data: sessionsData, isLoading } = useGetSessionsByDeptQuery(
        { deptId },
        { skip: !deptId }
    );
    const [manualPromote, { isLoading: isPromoting }] = useManualPromoteMutation();

    const [lockSession] = useLockSessionMutation();
    const [unlockSession] = useUnlockSessionMutation();
    const [closeEnrollment] = useCloseEnrollmentMutation();

    const [modal, setModal] = useState({ open: false, sessionId: "" });
    const [reason, setReason] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    const sessions: AcademicSession[] = sessionsData?.data ?? [];

    const handlePromote = async () => {
        if (!reason.trim()) return;
        try {
            await manualPromote({ deptId, id: modal.sessionId, reason }).unwrap();
            toast.success("Semester promoted successfully");
            setModal({ open: false, sessionId: "" });
            setReason("");
        } catch (err: any) {
            toast.error(err?.data?.message ?? "Failed to promote semester");
        }
    };

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 mb-1">Academic Sessions</h1>
                    <p className="text-sm font-medium text-slate-500">Monitor all student batches in your department</p>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={() => setDrawerOpen((prev) => !prev)}
                    disabled={!deptId}
                    className="!bg-slate-900 !text-white !rounded-xl !border-slate-300 !font-bold !normal-case !shadow-none hover:shadow-lg transition-all disabled:opacity-50"
                >
                    Approve New Intake
                </Button>
            </div>

            {isLoading || !deptId ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl" />)}
                </div>
            ) : sessions.length === 0 ? (
                <Paper elevation={0} className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <CalendarDays size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="font-black text-slate-500">No active sessions</h3>
                    <p className="text-sm text-slate-400 font-medium mt-1 mb-6">Approve a new student intake to create the first cohort.</p>
                    <Button
                        variant="contained" startIcon={<Plus size={16} />}
                        onClick={() => setDrawerOpen(true)}
                        disabled={!deptId}
                        className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl !shadow-none disabled:opacity-50"
                    >
                        Approve First Intake
                    </Button>
                </Paper>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sessions.map(session => {
                        const nextPromoDate = new Date(session.nextPromotionDate);
                        const isOverdue = nextPromoDate <= new Date() && session.status === "active";
                        const progress = Math.round((session.currentSemester / 8) * 100);

                        return (
                            <Paper key={session._id} elevation={0} className="p-6 border border-slate-200 rounded-2xl bg-white flex flex-col hover:shadow-md transition-shadow">
                                {/* Top row */}
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-lg font-black text-slate-900">{session.startYear} – {session.endYear} Batch</h2>
                                            <Chip
                                                label={session.status}
                                                size="small"
                                                className={`!text-[10px] !font-black !uppercase !tracking-widest border ${session.status === "active" ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200" :
                                                    session.status === "locked" ? "!bg-amber-50 !text-amber-700 !border-amber-200" :
                                                        "!bg-slate-100 !text-slate-500 !border-slate-200"
                                                    }`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                            Current: <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded ml-1">Semester {session.currentSemester}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-slate-900">{session.totalEnrolledStudents}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">/ {session.intakeCapacity} enrolled</p>
                                    </div>
                                </div>

                                {/* Info grid */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Semesters</p>
                                        <p className="font-bold text-slate-700">8</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Next Promotion</p>
                                        <p className={`font-bold flex items-center gap-1 ${isOverdue ? "text-rose-600" : "text-slate-700"}`}>
                                            {isOverdue && <AlertTriangle size={14} />}
                                            {nextPromoDate.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                        <span>Semester Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                {/* Action / Management Controls */}
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex gap-2">
                                            {session.status !== "completed" && session.enrollmentOpen && (
                                                <Button size="small" variant="outlined" startIcon={<UserCheck size={13} />}
                                                    onClick={() => closeEnrollment({ deptId, id: session._id })}
                                                    className="!border-slate-200 !text-slate-600 !normal-case !font-bold !text-[11px] !rounded-xl">
                                                    Close Enrollment
                                                </Button>
                                            )}
                                            {session.status !== "completed" && session.status === "locked" ? (
                                                <Button size="small" variant="outlined" startIcon={<LockOpen size={13} />}
                                                    onClick={() => unlockSession({ deptId, id: session._id })}
                                                    className="!border-amber-200 !text-amber-600 !normal-case !font-bold !text-[11px] !rounded-xl">
                                                    Unlock
                                                </Button>
                                            ) : session.status !== "completed" ? (
                                                <Button size="small" variant="outlined" startIcon={<Lock size={13} />}
                                                    onClick={() => lockSession({ deptId, id: session._id })}
                                                    className="!border-slate-200 !text-slate-500 !normal-case !font-bold !text-[11px] !rounded-xl">
                                                    Lock
                                                </Button>
                                            ) : null}
                                        </div>

                                        {isOverdue && session.status === "active" ? (
                                            <Button variant="contained" size="small" startIcon={<Play size={14} />}
                                                onClick={() => setModal({ open: true, sessionId: session._id })}
                                                className="!bg-rose-500 hover:!bg-rose-600 !text-white !font-black !text-[10px] !uppercase !tracking-widest !rounded-lg !shadow-none">
                                                Promote Now
                                            </Button>
                                        ) : session.status === "active" ? (
                                            <Button variant="outlined" size="small" startIcon={<ArrowUpCircle size={14} />}
                                                onClick={() => setModal({ open: true, sessionId: session._id })}
                                                className="!border-indigo-200 !text-indigo-600 !font-black !text-[10px] !uppercase !tracking-widest !rounded-lg !shadow-none">
                                                Manual Promote
                                            </Button>
                                        ) : (
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                                                Next: {nextPromoDate.toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Paper>
                        );
                    })}
                </div>
            )}

            {/* Promote dialog */}
            <Dialog
                open={modal.open}
                onClose={() => !isPromoting && setModal({ open: false, sessionId: "" })}
                PaperProps={{ className: "rounded-2xl p-2 w-full max-w-sm" }}
            >
                <DialogTitle className="font-black text-slate-900">Confirm Semester Promotion</DialogTitle>
                <DialogContent>
                    <p className="text-sm text-slate-600 font-medium mb-4">Enter a reason for the audit log.</p>
                    <TextField
                        fullWidth multiline rows={3} value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Reason for manual promotion…"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                </DialogContent>
                <DialogActions className="px-6 pb-4">
                    <Button onClick={() => setModal({ open: false, sessionId: "" })} disabled={isPromoting} className="!text-slate-500 !font-bold">
                        Cancel
                    </Button>
                    <Button
                        variant="contained" disabled={!reason.trim() || isPromoting}
                        onClick={handlePromote}
                        className="!bg-slate-900 hover:!bg-slate-800 !rounded-xl !font-bold !px-6"
                    >
                        {isPromoting ? "Promoting…" : "Promote"}
                    </Button>
                </DialogActions>
            </Dialog>

            <NewIntakeDrawer
                open={drawerOpen}
                deptId={deptId}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
};

export default HODAcademicSessions;
