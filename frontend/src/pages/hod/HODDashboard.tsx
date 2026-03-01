import { Typography, Paper, Chip } from "@mui/material";
import { Users, BookOpen, CalendarCheck, ShieldCheck, GraduationCap } from "lucide-react";
import { useGetHODDashboardQuery } from "../../services/hod/hod.service";
import { useSelector } from "react-redux";

const StatCard = ({ title, value, icon, bg }: { title: string; value: any; icon: React.ReactNode; bg: string }) => (
    <Paper elevation={0} className="p-6 rounded-2xl border border-slate-200 flex items-center gap-5 bg-white hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-xl ${bg}`}>{icon}</div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
            <Typography variant="h4" className="font-black text-slate-900">{value}</Typography>
        </div>
    </Paper>
);

const HODDashboard = () => {
    const { name } = useSelector((state: any) => state.auth);
    const { data, isLoading } = useGetHODDashboardQuery();

    const stats = data?.data?.stats;
    const sessions = data?.data?.sessions ?? [];

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome back, {name || "HOD"} 👋</h1>
                <p className="text-sm font-medium text-slate-500">Here is an overview of your department operations.</p>
            </div>

            {/* Stat cards — plain CSS grid to avoid MUI Grid item-prop issues */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)
                ) : (
                    <>
                        <StatCard title="Active Sessions" value={stats?.activeSessions ?? 0}
                            icon={<CalendarCheck size={24} className="text-blue-600" />} bg="bg-blue-50" />
                        <StatCard title="Total Students" value={stats?.studentCount ?? 0}
                            icon={<GraduationCap size={24} className="text-emerald-600" />} bg="bg-emerald-50" />
                        <StatCard title="Faculty Members" value={stats?.facultyCount ?? 0}
                            icon={<BookOpen size={24} className="text-indigo-600" />} bg="bg-indigo-50" />
                        <StatCard title="My Role" value="HOD"
                            icon={<ShieldCheck size={24} className="text-amber-600" />} bg="bg-amber-50" />
                    </>
                )}
            </div>

            {/* Sessions monitoring table */}
            <Paper elevation={0} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                    <h2 className="text-base font-black text-slate-900">Academic Session Monitor</h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">All academic batches in your department</p>
                </div>

                {isLoading ? (
                    <div className="p-12 space-y-4 animate-pulse">
                        {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                        <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-bold">No academic sessions in your department yet.</p>
                        <p className="text-sm">Contact the principal to approve a new intake.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {["Batch", "Current Semester", "Students", "Next Promotion", "Status"].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((s: any) => (
                                    <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{s.startYear} – {s.endYear}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg">Sem {s.currentSemester}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-600">{s.totalEnrolledStudents} / {s.intakeCapacity}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">
                                            {new Date(s.nextPromotionDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Chip
                                                label={s.status} size="small"
                                                className={`!text-[10px] !font-black !uppercase !tracking-widest border ${s.status === "active" ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200" :
                                                        s.status === "locked" ? "!bg-amber-50 !text-amber-700 !border-amber-200" :
                                                            "!bg-slate-100 !text-slate-500 !border-slate-200"
                                                    }`}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Paper>
        </div>
    );
};

export default HODDashboard;
