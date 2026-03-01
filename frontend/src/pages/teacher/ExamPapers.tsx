import { useState } from "react";
import {
    Paper, Button, Chip,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { Plus, FileText, Send, Edit2, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { Link, useSearchParams } from "react-router-dom";
import {
    useGetMyExamPapersQuery,
    useSubmitExamPaperMutation,
} from "../../services/examPaper/examPaper.service";

const statusColors: Record<string, string> = {
    draft: "!bg-slate-100 !text-slate-600 !border-slate-200",
    submitted: "!bg-amber-50 !text-amber-700 !border-amber-200",
    approved: "!bg-emerald-50 !text-emerald-700 !border-emerald-200",
    rejected: "!bg-rose-50 !text-rose-700 !border-rose-200",
};

const ExamPapers = () => {
    const [searchParams] = useSearchParams();
    const preSelected = searchParams.get("subject") ?? "";
    const { data, isLoading } = useGetMyExamPapersQuery();
    const [submit, { isLoading: submitting }] = useSubmitExamPaperMutation();
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const papers = (data?.data ?? []).filter(p =>
        !preSelected || (typeof p.subject === "object" ? p.subject._id : p.subject) === preSelected
    );

    const handleSubmit = async () => {
        if (!confirmId) return;
        try {
            await submit(confirmId).unwrap();
            toast.success("Paper submitted for HOD review");
        } catch (e: any) { toast.error(e?.data?.error ?? "Failed to submit"); }
        setConfirmId(null);
    };

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 mb-1">Exam Papers</h1>
                    <p className="text-sm font-medium text-slate-500">Create, manage, and submit exam papers for HOD review</p>
                </div>
                <Button component={Link} to="/teacher/exam-papers/builder"
                    variant="contained" startIcon={<Plus size={16} />}
                    className="!bg-slate-900 !text-white !rounded-xl !font-bold !normal-case !shadow-none">
                    New Paper
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4 animate-pulse">{[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}</div>
            ) : papers.length === 0 ? (
                <Paper elevation={0} className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="font-black text-slate-500">No exam papers yet</h3>
                    <p className="text-sm text-slate-400 mt-1">Use the <strong>New Paper</strong> button to open the Paper Builder.</p>
                    <Button component={Link} to="/teacher/exam-papers/builder"
                        variant="contained" className="!mt-5 !bg-indigo-600 !rounded-xl !font-bold !normal-case !shadow-none">
                        Open Paper Builder
                    </Button>
                </Paper>
            ) : (
                <div className="space-y-4">
                    {papers.map((p: any) => {
                        const subj = typeof p.subject === "object" ? p.subject : null;
                        return (
                            <Paper key={p._id} elevation={0} className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div className="min-w-0">
                                        <h3 className="font-black text-slate-900">{p.title}</h3>
                                        {subj && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{subj.name} · Sem {subj.semester}</p>}
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 font-medium">
                                            <span>{p.totalMarks} marks</span>
                                            <span>{p.duration} min</span>
                                            <span>{p.questions?.length ?? 0} questions</span>
                                        </div>
                                        {p.status === "rejected" && p.rejectionReason && (
                                            <p className="mt-2 text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg inline-block">
                                                ✕ Rejected: {p.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Chip label={p.status} size="small"
                                            className={`!text-[10px] !font-black !uppercase border ${statusColors[p.status]}`} />
                                        {p.status === "draft" && (
                                            <>
                                                <Button component={Link} to={`/teacher/exam-papers/builder?edit=${p._id}`}
                                                    size="small" variant="outlined" startIcon={<Edit2 size={12} />}
                                                    className="!text-[11px] !font-bold !normal-case !rounded-xl !border-slate-200 !text-slate-600">
                                                    Edit in Builder
                                                </Button>
                                                <Button size="small" variant="contained" startIcon={<Send size={12} />}
                                                    onClick={() => setConfirmId(p._id)}
                                                    className="!bg-indigo-600 !text-white !text-[11px] !font-bold !normal-case !rounded-xl !shadow-none">
                                                    Submit
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Paper>
                        );
                    })}
                </div>
            )}

            {/* Submit Confirm */}
            <Dialog open={!!confirmId} onClose={() => setConfirmId(null)}
                PaperProps={{ className: "rounded-2xl p-2 w-full max-w-sm" }}>
                <DialogTitle className="font-black text-slate-900">Submit for Review?</DialogTitle>
                <DialogContent>
                    <DialogContentText>Once submitted, the HOD will review and approve or reject this paper. You won't be able to edit it.</DialogContentText>
                </DialogContent>
                <DialogActions className="px-6 pb-4">
                    <Button onClick={() => setConfirmId(null)} className="!text-slate-500 !font-bold">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={submitting} variant="contained"
                        className="!bg-indigo-600 !rounded-xl !font-bold">
                        {submitting ? "Submitting…" : "Submit"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ExamPapers;
