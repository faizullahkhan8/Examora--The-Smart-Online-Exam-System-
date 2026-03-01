import { useState } from "react";
import { Paper, Button, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { BookOpen, ChevronRight, FileText, CalendarCheck, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetMySubjectsQuery } from "../../services/teacher/teacher.service";
import { useGetExamPapersBySubjectQuery } from "../../services/examPaper/examPaper.service";
import { useGetAttendanceBySubjectQuery } from "../../services/attendance/attendance.service";
import { useGetMaterialsBySubjectQuery } from "../../services/material/material.service";

const statusCls: Record<string, string> = {
    active: "!bg-emerald-50 !text-emerald-700 !border-emerald-200",
    upcoming: "!bg-slate-100 !text-slate-500 !border-slate-200",
    locked: "!bg-amber-50 !text-amber-700 !border-amber-200",
    completed: "!bg-rose-50 !text-rose-700 !border-rose-200",
};

// ─── Subject card with mini-stats ────────────────────────────────────────────
const SubjectCard = ({ subject }: { subject: any }) => {
    const { data: papers } = useGetExamPapersBySubjectQuery(subject._id);
    const { data: attendance } = useGetAttendanceBySubjectQuery(subject._id);
    const { data: materials } = useGetMaterialsBySubjectQuery(subject._id);

    return (
        <Paper elevation={0} className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{subject.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {subject.code} · Sem {subject.semester}
                    </p>
                </div>
                <Chip label={subject.session?.status ?? "active"} size="small"
                    className={`!text-[10px] !font-black !uppercase border ${statusCls[subject.session?.status] ?? statusCls.active}`} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-slate-900">{papers?.data?.length ?? 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Papers</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-slate-900">{attendance?.data?.length ?? 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classes</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-black text-slate-900">{materials?.data?.length ?? 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Materials</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <Button component={Link} to={`/teacher/exam-papers?subject=${subject._id}`}
                    size="small" startIcon={<FileText size={13} />} variant="outlined"
                    className="!text-[11px] !font-bold !normal-case !rounded-xl !border-slate-200 !text-slate-600">
                    Exam Papers
                </Button>
                <Button component={Link} to={`/teacher/attendance?subject=${subject._id}`}
                    size="small" startIcon={<CalendarCheck size={13} />} variant="outlined"
                    className="!text-[11px] !font-bold !normal-case !rounded-xl !border-slate-200 !text-slate-600">
                    Attendance
                </Button>
                <Button component={Link} to={`/teacher/materials?subject=${subject._id}`}
                    size="small" startIcon={<BookMarked size={13} />} variant="outlined"
                    className="!text-[11px] !font-bold !normal-case !rounded-xl !border-slate-200 !text-slate-600">
                    Materials
                </Button>
            </div>
        </Paper>
    );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const MySubjects = () => {
    const { data, isLoading } = useGetMySubjectsQuery();
    const subjects = data?.data ?? [];

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-1">My Subjects</h1>
                <p className="text-sm font-medium text-slate-500">All subjects currently assigned to you</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-56 bg-slate-100 rounded-2xl" />)}
                </div>
            ) : subjects.length === 0 ? (
                <Paper elevation={0} className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="font-black text-slate-500">No subjects assigned</h3>
                    <p className="text-sm text-slate-400 mt-1">Contact your HOD to get subjects assigned.</p>
                </Paper>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {subjects.map((s: any) => <SubjectCard key={s._id} subject={s} />)}
                </div>
            )}
        </div>
    );
};

export default MySubjects;
