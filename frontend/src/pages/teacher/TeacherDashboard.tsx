import { Typography, Paper, Chip } from "@mui/material";
import {
    BookOpen, FileText, CalendarCheck, BookMarked, GraduationCap,
} from "lucide-react";
import { useGetTeacherDashboardQuery, useGetTeacherProfileQuery } from "../../services/teacher/teacher.service";

const StatCard = ({ title, value, icon, bg }: { title: string; value: any; icon: React.ReactNode; bg: string }) => (
    <Paper elevation={0} className="p-6 rounded-2xl border border-slate-200 flex items-center gap-5 bg-white hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-xl ${bg}`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <Typography variant="h4" className="font-black text-slate-900">{value}</Typography>
        </div>
    </Paper>
);

const TeacherDashboard = () => {
    const { data: profile } = useGetTeacherProfileQuery();
    const { data, isLoading } = useGetTeacherDashboardQuery();

    const stats = data?.data?.stats;
    const subjects = data?.data?.subjects ?? [];
    const teacher = profile?.data;

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-1">
                    Welcome back, {teacher?.firstName || "Teacher"} 👋
                </h1>
                <p className="text-sm font-medium text-slate-500">
                    {teacher?.department?.name ?? "Loading department..."} · Teacher Panel
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)
                ) : (
                    <>
                        <StatCard title="Assigned Subjects" value={stats?.totalSubjects ?? 0}
                            icon={<BookOpen size={24} className="text-indigo-600" />} bg="bg-indigo-50" />
                        <StatCard title="Total Students" value={stats?.totalStudents ?? 0}
                            icon={<GraduationCap size={24} className="text-emerald-600" />} bg="bg-emerald-50" />
                        <StatCard title="Pending Papers" value={stats?.pendingPapers ?? 0}
                            icon={<FileText size={24} className="text-amber-600" />} bg="bg-amber-50" />
                        <StatCard title="Approved Papers" value={stats?.approvedPapers ?? 0}
                            icon={<BookMarked size={24} className="text-blue-600" />} bg="bg-blue-50" />
                    </>
                )}
            </div>

            {/* Subjects overview */}
            <Paper elevation={0} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                    <h2 className="text-base font-black text-slate-900">My Subjects</h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">Subjects assigned to you this semester</p>
                </div>
                {isLoading ? (
                    <div className="p-12 space-y-4 animate-pulse">
                        {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No subjects assigned yet</p>
                        <p className="text-sm">Contact your HOD to get subjects assigned to you.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {["Subject", "Code", "Semester", "Credits", "Session", "Status"].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((s: any) => (
                                    <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                                        <td className="px-6 py-4"><span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg">{s.code}</span></td>
                                        <td className="px-6 py-4 font-semibold text-slate-600">Sem {s.semester}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{s.creditHours} hrs</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{s.session?.startYear}–{s.session?.endYear}</td>
                                        <td className="px-6 py-4">
                                            <Chip label={s.isActive ? "Active" : "Inactive"} size="small"
                                                className={`!text-[10px] !font-black !uppercase border ${s.isActive ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200" : "!bg-slate-100 !text-slate-500 !border-slate-200"}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Paper>

            {/* Attendance quick stat */}
            <div className="mt-6 flex items-center gap-3 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                <CalendarCheck size={28} className="text-indigo-600 shrink-0" />
                <div>
                    <p className="font-black text-indigo-900 text-sm">Mark attendance for your students regularly.</p>
                    <p className="text-xs text-indigo-600 mt-0.5">Navigate to the Attendance section to record today's class.</p>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
