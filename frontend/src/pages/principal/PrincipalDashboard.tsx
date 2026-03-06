import { useMemo } from "react";
import {
    BookOpen,
    Users,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    ChevronRight,
    Building2,
    CalendarDays,
} from "lucide-react";
import { Skeleton } from "@mui/material";
import { useGetDepartmentsQuery } from "../../services/department/department.service";
import { useSelector } from "react-redux";

const StatCard = ({
    label,
    value,
    icon: Icon,
    colorClass,
    loading,
}: {
    label: string;
    value: string | number;
    icon: any;
    colorClass: string;
    loading?: boolean;
}) => (
    <div className="p-5 bg-(--bg-surface) border border-(--ui-border) rounded-xl hover:border-(--brand-primary) transition-colors shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg bg-(--bg-base) w-fit ${colorClass}`}>
                <Icon size={20} className="text-current" />
            </div>
        </div>
        {loading ? (
            <Skeleton width={48} height={32} sx={{ bgcolor: "var(--ui-divider)", mb: 0.5 }} />
        ) : (
            <h3 className="text-2xl font-black text-(--text-primary) tracking-tight">{value}</h3>
        )}
        <p className="text-xs font-semibold text-(--text-secondary) mt-1">{label}</p>
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
        className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-(--ui-border) hover:bg-(--bg-base) transition-all group"
    >
        <div className="p-2.5 bg-(--bg-surface) border border-(--ui-border) rounded-lg shadow-sm group-hover:border-(--brand-primary) transition-colors">
            <Icon size={18} className="text-(--brand-primary)" />
        </div>
        <div className="grow">
            <p className="text-sm font-bold text-(--text-primary)">{label}</p>
            <p className="text-xs text-(--text-secondary) font-medium mt-0.5">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-(--text-secondary) group-hover:text-(--brand-primary) group-hover:translate-x-1 transition-all" />
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
        <div className="w-full bg-(--bg-base) min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">

                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            Welcome back, {auth.name?.split(" ")[0] ?? "Principal"}
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Institute Overview and Management Dashboard.
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-(--text-secondary) mb-4">
                            Institute Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Total Departments"
                                value={departments.length}
                                icon={BookOpen}
                                colorClass="text-indigo-600 bg-indigo-50"
                                loading={deptLoading}
                            />
                            <StatCard
                                label="Active Departments"
                                value={activeDepts}
                                icon={CheckCircle2}
                                colorClass="text-emerald-600 bg-emerald-50"
                                loading={deptLoading}
                            />
                            <StatCard
                                label="HODs Assigned"
                                value={hodsAssigned}
                                icon={Users}
                                colorClass="text-blue-600 bg-blue-50"
                                loading={deptLoading}
                            />
                            <StatCard
                                label="Depts w/o HOD"
                                value={deptsWithoutHOD}
                                icon={AlertTriangle}
                                colorClass={deptsWithoutHOD > 0 ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-100"}
                                loading={deptLoading}
                            />
                        </div>
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <section className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-(--text-secondary) mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-1">
                                <QuickAction label="Manage Departments" desc="Create, edit or assign HODs" icon={BookOpen} href="/principal/departments" />
                                <QuickAction label="HOD Management" desc="View and manage all HODs" icon={Users} href="/principal/hods" />
                                <QuickAction label="Academic Sessions" desc="View and lock sessions" icon={CalendarDays} href="/principal/sessions" />
                                <QuickAction label="Institute Profile" desc="Update institute information" icon={Building2} href="/principal/institute" />
                                <QuickAction label="Analytics & Reports" desc="View performance metrics" icon={BarChart3} href="/principal/analytics" />
                            </div>
                        </section>

                        <section className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-(--text-secondary)">
                                    Departments
                                </h2>
                                <a href="/principal/departments"
                                    className="text-[10px] font-bold uppercase tracking-widest text-(--brand-primary) hover:underline flex items-center gap-1">
                                    View All <ChevronRight size={12} />
                                </a>
                            </div>

                            <div className="grow overflow-y-auto custom-scrollbar pr-1">
                                {deptLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} height={56} sx={{ mb: 1.5, borderRadius: "12px", bgcolor: "var(--ui-divider)" }} variant="rectangular" />
                                    ))
                                ) : departments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-(--text-secondary) opacity-60 py-8">
                                        <BookOpen size={32} className="mb-3" />
                                        <p className="text-sm font-semibold">No departments yet</p>
                                        <a href="/principal/departments" className="text-xs text-(--brand-primary) font-bold hover:underline mt-1">
                                            Create your first department →
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {departments.slice(0, 5).map((dept) => (
                                            <div key={dept._id} className="flex items-center justify-between p-3.5 rounded-xl border border-(--ui-border) bg-(--bg-base) hover:border-(--brand-primary) transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-(--text-primary)">{dept.name}</p>
                                                    <p className="text-[11px] text-(--text-secondary) font-semibold mt-0.5">{dept.code}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {dept.hod ? (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                                                            Vacant
                                                        </span>
                                                    )}
                                                    <span className={`w-2 h-2 rounded-full ${dept.isActive ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]"}`} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalDashboard;