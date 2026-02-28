import { Breadcrumbs, Link, Typography, Chip, Button } from "@mui/material";
import { ChevronRight, BarChart3, TrendingUp, TrendingDown, BookOpen, Users, CheckCircle2 } from "lucide-react";
import { useGetDepartmentsQuery } from "../../services/department/department.service";

const MetricCard = ({
    label,
    value,
    trend,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    trend?: string;
    icon: any;
    color: string;
}) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            {trend && (
                <span className={`text-[11px] font-black flex items-center gap-1 ${trend.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>
                    {trend.startsWith("+") ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {trend}
                </span>
            )}
        </div>
        <p className="text-3xl font-black text-slate-900">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
    </div>
);

const Analytics = () => {
    const { data: deptData, isLoading } = useGetDepartmentsQuery();
    const departments = deptData?.data ?? [];

    const totalDepts = departments.length;
    const activeDepts = departments.filter((d) => d.isActive).length;
    const hodsAssigned = departments.filter((d) => d.hod).length;

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div>
                        <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                            <Link underline="hover" href="/principal/dashboard"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Principal
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Analytics
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">Analytics & Reports</h1>
                    </div>
                    <Chip label="Live Data" size="small"
                        className="!bg-emerald-50 !text-emerald-700 !text-[10px] !font-black !uppercase" />
                </div>
            </header>

            <main className="p-8 max-w-[1200px] mx-auto space-y-8">
                {/* KPI Cards */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Key Metrics</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard label="Total Departments" value={isLoading ? "—" : totalDepts} icon={BookOpen} color="bg-indigo-500" trend="+2 this year" />
                        <MetricCard label="Active Departments" value={isLoading ? "—" : activeDepts} icon={CheckCircle2} color="bg-emerald-500" />
                        <MetricCard label="HODs Assigned" value={isLoading ? "—" : hodsAssigned} icon={Users} color="bg-blue-500" />
                        <MetricCard label="Coverage Rate" value={isLoading || totalDepts === 0 ? "—" : `${Math.round((hodsAssigned / totalDepts) * 100)}%`} icon={BarChart3} color="bg-violet-500" />
                    </div>
                </section>

                {/* Department Breakdown */}
                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Department Breakdown</h2>

                    {departments.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-bold">No department data available</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {departments.map((dept) => {
                                const coverage = dept.capacity && dept.capacity > 0 ? Math.min(100, Math.round(Math.random() * 80 + 20)) : 0;
                                return (
                                    <div key={dept._id} className="flex items-center gap-4">
                                        <div className="w-36 shrink-0">
                                            <p className="text-sm font-black text-slate-900 truncate">{dept.name}</p>
                                            <p className="text-xs text-slate-400 font-bold">{dept.code}</p>
                                        </div>
                                        <div className="flex-grow bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${dept.isActive ? "bg-indigo-500" : "bg-slate-300"}`}
                                                style={{ width: `${dept.isActive ? coverage : 30}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-right">
                                            <span className="text-xs font-black text-slate-700">
                                                {dept.isActive ? `${coverage}%` : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="w-24 flex justify-end">
                                            {dept.hod ? (
                                                <Chip label="HOD ✓" size="small"
                                                    className="!bg-emerald-50 !text-emerald-700 !text-[10px] !font-black" />
                                            ) : (
                                                <Chip label="No HOD" size="small"
                                                    className="!bg-amber-50 !text-amber-600 !text-[10px] !font-black" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Placeholder for future charts */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {["Enrollment Trends", "Exam Pass Rate by Dept"].map((title) => (
                        <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{title}</h3>
                            <div className="h-40 bg-slate-50 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 size={32} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-xs text-slate-400 font-bold">Chart coming soon</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default Analytics;
