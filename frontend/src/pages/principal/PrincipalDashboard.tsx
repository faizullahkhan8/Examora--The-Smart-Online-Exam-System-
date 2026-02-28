import { useMemo } from "react";
import {
    BookOpen,
    Users,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    ChevronRight,
    Building2,
    CalendarDays,
} from "lucide-react";
import { Breadcrumbs, Link, Typography, Skeleton } from "@mui/material";
import { useGetDepartmentsQuery } from "../../services/department/department.service";
import { useSelector } from "react-redux";

const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    loading,
}: {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    loading?: boolean;
}) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-5 shadow-sm">
        <div className={`p-4 rounded-xl ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            {loading ? (
                <Skeleton width={48} height={32} />
            ) : (
                <p className="text-3xl font-black text-slate-900">{value}</p>
            )}
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                {label}
            </p>
        </div>
    </div>
);

const QuickAction = ({
    label,
    desc,
    icon: Icon,
    href,
}: {
    label: string;
    desc: string;
    icon: any;
    href: string;
}) => (
    <a
        href={href}
        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
    >
        <div className="p-3 bg-white rounded-xl shadow-sm">
            <Icon size={20} className="text-slate-600" />
        </div>
        <div className="flex-grow">
            <p className="text-sm font-black text-slate-900">{label}</p>
            <p className="text-xs text-slate-500 font-medium">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
    </a>
);

const PrincipalDashboard = () => {
    const auth = useSelector((state: any) => state.auth);
    const { data: deptData, isLoading: deptLoading } = useGetDepartmentsQuery();

    const departments = deptData?.data ?? [];
    const activeDepts = useMemo(() => departments.filter((d) => d.isActive).length, [departments]);
    const hodsAssigned = useMemo(() => departments.filter((d) => d.hod).length, [departments]);
    const deptsWithoutHOD = departments.length - hodsAssigned;

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div>
                        <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                            <Link underline="hover" color="inherit" href="/principal/dashboard"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Principal Panel
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Dashboard
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">
                            Welcome back, {auth.name?.split(" ")[0] ?? "Principal"} 👋
                        </h1>
                    </div>
                </div>
            </header>

            <main className="p-8 space-y-8 max-w-[1200px] mx-auto">
                {/* Stats */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                        Institute Overview
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Departments" value={departments.length} icon={BookOpen} color="bg-indigo-500" loading={deptLoading} />
                        <StatCard label="Active Departments" value={activeDepts} icon={CheckCircle2} color="bg-emerald-500" loading={deptLoading} />
                        <StatCard label="HODs Assigned" value={hodsAssigned} icon={Users} color="bg-blue-500" loading={deptLoading} />
                        <StatCard label="Depts w/o HOD" value={deptsWithoutHOD} icon={AlertTriangle} color={deptsWithoutHOD > 0 ? "bg-amber-500" : "bg-slate-400"} loading={deptLoading} />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions */}
                    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-2">
                            <QuickAction label="Manage Departments" desc="Create, edit or assign HODs" icon={BookOpen} href="/principal/departments" />
                            <QuickAction label="HOD Management" desc="View and manage all HODs" icon={Users} href="/principal/hods" />
                            <QuickAction label="Academic Sessions" desc="View and lock sessions" icon={CalendarDays} href="/principal/sessions" />
                            <QuickAction label="Institute Profile" desc="Update institute information" icon={Building2} href="/principal/institute" />
                            <QuickAction label="Analytics & Reports" desc="View performance metrics" icon={BarChart3} href="/principal/analytics" />
                        </div>
                    </section>

                    {/* Departments Summary */}
                    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                Departments
                            </h2>
                            <a href="/principal/departments"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:underline flex items-center gap-1">
                                View All <ChevronRight size={12} />
                            </a>
                        </div>

                        {deptLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} height={48} className="mb-2 rounded-xl" />
                            ))
                        ) : departments.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm font-bold">No departments yet</p>
                                <a href="/principal/departments" className="text-xs text-blue-600 font-bold hover:underline">
                                    Create your first department →
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {departments.slice(0, 5).map((dept) => (
                                    <div key={dept._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{dept.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{dept.code}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {dept.hod ? (
                                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    HOD Assigned
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    No HOD
                                                </span>
                                            )}
                                            <span className={`w-2 h-2 rounded-full ${dept.isActive ? "bg-emerald-400" : "bg-slate-300"}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Analytics teaser */}
                <section className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                Performance Insights
                            </p>
                            <h3 className="text-2xl font-black mb-1">View Full Analytics</h3>
                            <p className="text-slate-400 text-sm font-medium">
                                Department performance, exam metrics, and enrollment trends.
                            </p>
                        </div>
                        <a href="/principal/analytics"
                            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-100 transition-colors">
                            <TrendingUp size={18} />
                            Analytics
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PrincipalDashboard;
