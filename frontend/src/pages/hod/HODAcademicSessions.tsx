import { useState } from "react";
import { Button, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { CalendarDays, AlertTriangle, Play, Info } from "lucide-react";
import { toast } from "react-toastify";
import { useGetHODProfileQuery } from "../../services/hod/hod.service";
import { useGetSessionsByDeptQuery, useManualPromoteMutation } from "../../services/academicSession/academicSession.service";
import type { AcademicSession } from "../../services/academicSession/academicSession.service";

const HODAcademicSessions = () => {
    const { data: profileData } = useGetHODProfileQuery();
    const deptId = profileData?.data?.department?._id ?? "";

    const { data: sessionsData, isLoading } = useGetSessionsByDeptQuery(
        { deptId },
        { skip: !deptId }
    );
    const [manualPromote, { isLoading: isPromoting }] = useManualPromoteMutation();

    const [modal, setModal] = useState({ open: false, sessionId: "" });
    const [reason, setReason] = useState("");

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
                    variant="outlined"
                    startIcon={<Info size={16} />}
                    onClick={() => toast.info("New intake requests must be submitted to the Principal for approval.")}
                    className="!rounded-xl !border-slate-300 !text-slate-600 !font-bold !normal-case"
                >
                    Request New Intake
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
                    <p className="text-sm text-slate-400 font-medium mt-1">Coordinate with the Principal to approve a new intake.</p>
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

                                {/* Action */}
                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                                    {isOverdue ? (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<Play size={14} />}
                                            onClick={() => setModal({ open: true, sessionId: session._id })}
                                            className="!bg-rose-500 hover:!bg-rose-600 !text-white !font-black !text-[10px] !uppercase !tracking-widest !rounded-lg !shadow-none"
                                        >
                                            Promotion Overdue — Promote Now
                                        </Button>
                                    ) : (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Next: {nextPromoDate.toLocaleDateString()}
                                        </p>
                                    )}
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
        </div>
    );
};

export default HODAcademicSessions;
