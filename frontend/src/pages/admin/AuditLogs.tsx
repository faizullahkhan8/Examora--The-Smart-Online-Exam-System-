import { useMemo, useState } from "react";
import {
    Avatar,
    Breadcrumbs,
    Button,
    CircularProgress,
    IconButton,
    Link,
    Pagination,
    Typography,
} from "@mui/material";
import {
    Activity,
    AlertCircle,
    ChevronRight,
    Clock,
    Copy,
    Download,
    Globe,
    RefreshCcw,
    Search,
    ShieldAlert,
    UserRound,
    X,
} from "lucide-react";
import {
    type AuditLog,
    type AuditSeverity,
    type AuditStatus,
    useGetAuditLogsQuery,
} from "../../services/auditLog/auditLog.service";

const severityConfig: Record<
    AuditSeverity,
    {
        color: string;
        icon: typeof Activity;
    }
> = {
    Info: {
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: Activity,
    },
    Warning: {
        color: "bg-amber-50 text-amber-600 border-amber-100",
        icon: AlertCircle,
    },
    Critical: {
        color: "bg-rose-50 text-rose-600 border-rose-100",
        icon: ShieldAlert,
    },
};

const statusPillClass: Record<AuditStatus, string> = {
    Success: "bg-emerald-50 text-emerald-600",
    Failed: "bg-rose-50 text-rose-600",
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

const copyJson = async (value: unknown) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
};

const AuditLogs = () => {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "">("");
    const [statusFilter, setStatusFilter] = useState<AuditStatus | "">("");
    const [methodFilter, setMethodFilter] = useState("");
    const [page, setPage] = useState(1);

    const queryParams = useMemo(
        () => ({
            search: searchTerm || undefined,
            severity: severityFilter || undefined,
            status: statusFilter || undefined,
            method: methodFilter || undefined,
            page,
            limit: 20,
        }),
        [methodFilter, page, searchTerm, severityFilter, statusFilter],
    );

    const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery(queryParams);

    const logs = data?.data ?? [];
    const pagination = data?.pagination;
    const stats = data?.stats;

    const kpiStats = [
        {
            label: "Total Events",
            value: stats?.totalEvents ?? 0,
            icon: Activity,
            color: "text-blue-600",
        },
        {
            label: "Security Alerts",
            value: stats?.securityAlerts ?? 0,
            icon: ShieldAlert,
            color: "text-rose-600",
        },
        {
            label: "Role Changes",
            value: stats?.roleChanges ?? 0,
            icon: UserRound,
            color: "text-purple-600",
        },
        {
            label: "Failed Logins",
            value: stats?.failedLogins ?? 0,
            icon: AlertCircle,
            color: "text-amber-600",
        },
    ];

    const latestSecurityAlert = logs.find((log) => log.severity !== "Info");

    const handleExport = () => {
        const payload = {
            exportedAt: new Date().toISOString(),
            filters: queryParams,
            stats,
            logs,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                <div className="flex flex-col">
                    <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                        <Link
                            underline="hover"
                            color="inherit"
                            href="#"
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                        >
                            Dashboard
                        </Link>
                        <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                            Audit Logs
                        </Typography>
                    </Breadcrumbs>
                    <h1 className="text-xl font-black text-slate-900">Audit Logs</h1>
                    <p className="text-[11px] text-slate-500 font-medium">
                        Real-time record of system operations and security events
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outlined"
                        startIcon={<Download size={16} />}
                        onClick={handleExport}
                        className="!border-slate-200 !text-slate-700 !rounded-xl !normal-case !font-bold !text-xs !px-4"
                    >
                        Export Logs
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={isFetching ? <CircularProgress size={14} color="inherit" /> : <RefreshCcw size={16} />}
                        onClick={() => refetch()}
                        className="!bg-slate-900 !text-white !rounded-xl !normal-case !font-bold !text-xs !px-4 !shadow-none"
                    >
                        Refresh
                    </Button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiStats.map((kpi) => (
                        <div
                            key={kpi.label}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`p-2.5 rounded-xl bg-slate-50 w-fit ${kpi.color}`}>
                                <kpi.icon size={20} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">
                                {kpi.label}
                            </p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {kpi.value.toLocaleString()}
                            </h3>
                        </div>
                    ))}
                </div>

                {latestSecurityAlert && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                            <ShieldAlert size={20} />
                        </div>
                        <div className="flex-grow">
                            <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">
                                {latestSecurityAlert.severity} Alert: {latestSecurityAlert.eventType}
                            </h4>
                            <p className="text-xs text-rose-700 font-medium mt-1">
                                {latestSecurityAlert.actorLabel} at {latestSecurityAlert.ip || "unknown IP"} on{" "}
                                {formatDateTime(latestSecurityAlert.createdAt)}.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search actor, event, target, IP..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            <select
                                title="severity filter"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                                value={severityFilter}
                                onChange={(e) => {
                                    setSeverityFilter(e.target.value as AuditSeverity | "");
                                    setPage(1);
                                }}
                            >
                                <option value="">Severity: All</option>
                                <option value="Info">Info</option>
                                <option value="Warning">Warning</option>
                                <option value="Critical">Critical</option>
                            </select>

                            <select
                                title="status filter"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as AuditStatus | "");
                                    setPage(1);
                                }}
                            >
                                <option value="">Status: All</option>
                                <option value="Success">Success</option>
                                <option value="Failed">Failed</option>
                            </select>

                            <select
                                title="method filter"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none"
                                value={methodFilter}
                                onChange={(e) => {
                                    setMethodFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">Method: All</option>
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <CircularProgress size={34} />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                <p className="text-sm font-bold">No audit logs found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Event Type
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Actor
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Target
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Context
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Severity
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => {
                                        const SeverityIcon = severityConfig[log.severity].icon;
                                        return (
                                            <tr
                                                key={log._id}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {formatDate(log.createdAt)}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {formatTime(log.createdAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`w-1.5 h-1.5 rounded-full ${log.status === "Success" ? "bg-emerald-500" : "bg-rose-500"}`}
                                                        />
                                                        <span className="text-xs font-black text-slate-800">
                                                            {log.eventType}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                fontSize: "10px",
                                                                fontWeight: 900,
                                                                bgcolor: "slate.900",
                                                            }}
                                                        >
                                                            {log.actorLabel.charAt(0)}
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {log.actorLabel}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                                {log.actorRole}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase text-[10px]">
                                                        {log.targetLabel || log.targetId || "-"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {log.path}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                            <Globe size={10} />
                                                            {log.ip || "Unknown IP"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 w-fit ${severityConfig[log.severity].color}`}
                                                    >
                                                        <SeverityIcon size={10} />
                                                        {log.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        size="small"
                                                        onClick={() => setSelectedLog(log)}
                                                        className="!text-[10px] !font-black !text-slate-900 hover:!bg-slate-100 !rounded-lg !px-3"
                                                    >
                                                        Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {pagination && pagination.pages > 1 && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <Pagination
                                count={pagination.pages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                size="small"
                                shape="rounded"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[580px] bg-white shadow-2xl z-50 transform transition-transform duration-300 border-l border-slate-200 ${selectedLog ? "translate-x-0" : "translate-x-full"}`}
            >
                {selectedLog && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                    Event Specification
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    {selectedLog._id}
                                </p>
                            </div>
                            <IconButton
                                onClick={() => setSelectedLog(null)}
                                className="hover:rotate-90 transition-transform"
                            >
                                <X size={20} />
                            </IconButton>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Status
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${statusPillClass[selectedLog.status]}`}
                                        >
                                            {selectedLog.status}
                                        </span>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${severityConfig[selectedLog.severity].color}`}
                                        >
                                            {selectedLog.severity}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Event Time
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-2">
                                        <Clock size={14} />
                                        {formatDateTime(selectedLog.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Actor & Target
                                </p>
                                <p className="text-sm font-bold text-slate-900">
                                    {selectedLog.actorLabel}
                                </p>
                                <p className="text-xs font-semibold text-slate-500 uppercase">
                                    {selectedLog.actorRole}
                                </p>
                                <p className="text-xs text-slate-700">
                                    Target: {selectedLog.targetLabel || selectedLog.targetId || "-"}
                                </p>
                                <p className="text-xs text-slate-700">
                                    Endpoint: {selectedLog.method} {selectedLog.path}
                                </p>
                                <p className="text-xs text-slate-700">
                                    IP: {selectedLog.ip || "Unknown"} | Status Code: {selectedLog.statusCode}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Metadata (JSON)
                                    </h4>
                                    <IconButton
                                        size="small"
                                        onClick={() => copyJson(selectedLog.metadata ?? {})}
                                        className="text-slate-400 hover:text-slate-900"
                                    >
                                        <Copy size={16} />
                                    </IconButton>
                                </div>
                                <pre className="bg-slate-900 rounded-2xl p-5 text-[11px] text-emerald-200 overflow-x-auto leading-relaxed">
                                    {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
