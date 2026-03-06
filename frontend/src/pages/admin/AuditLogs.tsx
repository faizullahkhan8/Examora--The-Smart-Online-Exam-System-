import { useMemo, useState } from "react";
import {
    Avatar,
    Button,
    CircularProgress,
    IconButton,
    TablePagination,
} from "@mui/material";
import {
    Activity,
    AlertCircle,
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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const queryParams = useMemo(
        () => ({
            search: searchTerm || undefined,
            severity: severityFilter || undefined,
            status: statusFilter || undefined,
            method: methodFilter || undefined,
            page: page + 1,
            limit: rowsPerPage,
        }),
        [methodFilter, page, rowsPerPage, searchTerm, severityFilter, statusFilter],
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

    const buttonSx = {
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
    };

    return (
        <div className="w-full bg-[var(--bg-base)] min-h-screen font-sans pb-10 relative">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            Audit Logs
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Real-time record of system operations and security events.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<Download size={16} />}
                            onClick={handleExport}
                            sx={{ ...buttonSx, borderColor: "var(--ui-border)", color: "var(--text-primary)", "&:hover": { borderColor: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}
                        >
                            Export Logs
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={isFetching ? <CircularProgress size={16} color="inherit" /> : <RefreshCcw size={16} />}
                            onClick={() => refetch()}
                            sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpiStats.map((kpi) => (
                            <div
                                key={kpi.label}
                                className="bg-(--bg-surface) p-5 rounded-xl border border-(--ui-border) shadow-sm hover:border-(--brand-primary) transition-colors"
                            >
                                <div className={`p-2.5 rounded-lg bg-[var(--bg-base)] w-fit ${kpi.color}`}>
                                    <kpi.icon size={20} />
                                </div>
                                <h3 className="text-2xl font-black text-(--text-primary) mt-3 tracking-tight">
                                    {kpi.value.toLocaleString()}
                                </h3>
                                <p className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider mt-1">
                                    {kpi.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {latestSecurityAlert && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                            <div className="bg-rose-100 p-2.5 rounded-lg text-rose-600">
                                <ShieldAlert size={20} />
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">
                                    {latestSecurityAlert.severity} Alert: {latestSecurityAlert.eventType}
                                </h4>
                                <p className="text-sm text-rose-700 font-medium mt-1 leading-relaxed">
                                    Action performed by <strong>{latestSecurityAlert.actorLabel}</strong> from IP Address <strong>{latestSecurityAlert.ip || "unknown IP"}</strong> on{" "}
                                    {formatDateTime(latestSecurityAlert.createdAt)}.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-(--ui-divider)">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-grow max-w-md">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search actor, event, target, IP..."
                                        className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-(--text-primary) outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) transition-all"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setPage(0);
                                        }}
                                    />
                                </div>

                                <select
                                    title="severity filter"
                                    className="bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium text-(--text-primary) outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) transition-all"
                                    value={severityFilter}
                                    onChange={(e) => {
                                        setSeverityFilter(e.target.value as AuditSeverity | "");
                                        setPage(0);
                                    }}
                                >
                                    <option value="">Severity: All</option>
                                    <option value="Info">Info</option>
                                    <option value="Warning">Warning</option>
                                    <option value="Critical">Critical</option>
                                </select>

                                <select
                                    title="status filter"
                                    className="bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium text-(--text-primary) outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) transition-all"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value as AuditStatus | "");
                                        setPage(0);
                                    }}
                                >
                                    <option value="">Status: All</option>
                                    <option value="Success">Success</option>
                                    <option value="Failed">Failed</option>
                                </select>

                                <select
                                    title="method filter"
                                    className="bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium text-(--text-primary) outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) transition-all"
                                    value={methodFilter}
                                    onChange={(e) => {
                                        setMethodFilter(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    <option value="">Method: All</option>
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
                                    <CircularProgress size={32} sx={{ color: "var(--brand-primary)" }} />
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-20 text-(--text-secondary) opacity-60">
                                    <p className="text-sm font-bold">No audit logs match criteria</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--bg-base)] border-b border-(--ui-divider)">
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                                                Timestamp
                                            </th>
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                                                Event Type
                                            </th>
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                                                Actor
                                            </th>
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                                                Target
                                            </th>
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                                                Context
                                            </th>
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                                                Severity
                                            </th>
                                            <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-(--ui-divider)">
                                        {logs.map((log) => {
                                            const SeverityIcon = severityConfig[log.severity].icon;
                                            return (
                                                <tr
                                                    key={log._id}
                                                    className="hover:bg-[var(--bg-base)] transition-colors"
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-(--text-primary)">
                                                                {formatDate(log.createdAt)}
                                                            </span>
                                                            <span className="text-[11px] text-(--text-secondary) font-semibold mt-0.5">
                                                                {formatTime(log.createdAt)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`w-2 h-2 rounded-full ${log.status === "Success" ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]"}`}
                                                            />
                                                            <span className="text-sm font-bold text-(--text-primary)">
                                                                {log.eventType}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    fontSize: "12px",
                                                                    fontWeight: 800,
                                                                    bgcolor: "var(--bg-sidebar)",
                                                                    color: "var(--text-on-dark)"
                                                                }}
                                                            >
                                                                {log.actorLabel.charAt(0)}
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-bold text-(--text-primary) truncate">
                                                                    {log.actorLabel}
                                                                </span>
                                                                <span className="text-[10px] text-(--text-secondary) font-bold uppercase tracking-wider mt-0.5 truncate">
                                                                    {log.actorRole}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-[11px] font-bold text-(--text-secondary) bg-[var(--bg-base)] border border-(--ui-border) px-2 py-1 rounded truncate max-w-[150px] inline-block">
                                                            {log.targetLabel || log.targetId || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs font-bold text-(--text-primary) truncate">
                                                                {log.path}
                                                            </span>
                                                            <span className="text-[11px] text-(--text-secondary) font-medium flex items-center gap-1 mt-0.5 truncate">
                                                                <Globe size={12} />
                                                                {log.ip || "Unknown IP"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 w-fit ${severityConfig[log.severity].color}`}
                                                        >
                                                            <SeverityIcon size={12} />
                                                            {log.severity}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <Button
                                                            size="small"
                                                            onClick={() => setSelectedLog(log)}
                                                            sx={{ textTransform: "none", fontWeight: 700, color: "var(--text-primary)", bgcolor: "var(--bg-base)", border: "1px solid var(--ui-border)", borderRadius: "6px", "&:hover": { bgcolor: "var(--ui-divider)" } }}
                                                        >
                                                            Inspect
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <TablePagination component="div"
                            count={pagination?.total ?? 0} page={page}
                            onPageChange={(_, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 25]}
                            sx={{
                                borderTop: "1px solid var(--ui-divider)",
                                ".MuiTablePagination-selectLabel,.MuiTablePagination-displayedRows": {
                                    fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)",
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedLog ? "translate-x-0" : "translate-x-full"}`}
            >
                {selectedLog && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-(--ui-divider) flex items-center justify-between bg-[var(--bg-base)]">
                            <div>
                                <h2 className="text-lg font-black text-(--text-primary) tracking-tight">
                                    Event Inspection
                                </h2>
                                <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest mt-1">
                                    ID: {selectedLog._id}
                                </p>
                            </div>
                            <IconButton
                                onClick={() => setSelectedLog(null)}
                                sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--ui-divider)" }, transition: "transform 0.2s", "&:hover ": { transform: "rotate(90deg)" } }}
                            >
                                <X size={20} />
                            </IconButton>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-(--ui-border) bg-[var(--bg-base)]">
                                    <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-2">
                                        Execution Status
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusPillClass[selectedLog.status]}`}
                                        >
                                            {selectedLog.status}
                                        </span>
                                        <span
                                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${severityConfig[selectedLog.severity].color}`}
                                        >
                                            {selectedLog.severity}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-(--ui-border) bg-[var(--bg-base)]">
                                    <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-2">
                                        Timestamp
                                    </p>
                                    <p className="text-sm font-bold text-(--text-primary) flex items-center gap-2">
                                        <Clock size={16} className="text-(--text-secondary)" />
                                        {formatDateTime(selectedLog.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl border border-(--ui-border) bg-(--bg-surface) space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-1">Actor Identity</p>
                                    <p className="text-sm font-black text-(--text-primary)">{selectedLog.actorLabel}</p>
                                    <p className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider mt-0.5">{selectedLog.actorRole}</p>
                                </div>
                                <div className="h-px bg-(--ui-divider) w-full" />
                                <div>
                                    <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-1">Target Object</p>
                                    <p className="text-sm font-bold text-(--text-primary)">{selectedLog.targetLabel || selectedLog.targetId || "No specific target"}</p>
                                </div>
                                <div className="h-px bg-(--ui-divider) w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-1">Network Route</p>
                                        <p className="text-sm font-bold text-(--text-primary)"><span className="text-(--brand-primary) mr-1">{selectedLog.method}</span> {selectedLog.path}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-1">Client Data</p>
                                        <p className="text-sm font-bold text-(--text-primary)">IP: {selectedLog.ip || "Unknown"}</p>
                                        <p className="text-xs text-(--text-secondary) font-medium mt-0.5">Status: {selectedLog.statusCode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                                        Raw JSON Metadata
                                    </h4>
                                    <Button
                                        size="small"
                                        startIcon={<Copy size={14} />}
                                        onClick={() => copyJson(selectedLog.metadata ?? {})}
                                        sx={{ textTransform: "none", color: "var(--brand-primary)", fontWeight: 700, p: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                                    >
                                        Copy Payload
                                    </Button>
                                </div>
                                <pre className="bg-(--bg-sidebar) rounded-xl p-5 text-xs text-emerald-400 overflow-x-auto leading-relaxed font-mono shadow-inner custom-scrollbar">
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
