import React, { useState, useMemo } from "react";
import {
    IconButton,
    Button,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    Avatar,
    Box,
    Typography,
    Pagination,
    Breadcrumbs,
    Link,
} from "@mui/material";
import {
    Activity,
    Search,
    Filter,
    Download,
    ChevronRight,
    ShieldAlert,
    UserCheck,
    Building2,
    Key,
    Globe,
    Monitor,
    MapPin,
    Clock,
    ExternalLink,
    X,
    Copy,
    AlertCircle,
    LogIn,
    LogOut,
    Settings,
    MoreVertical,
    FileJson,
    Calendar,
    RefreshCcw,
} from "lucide-react";

const SEVERITY_CONFIG = {
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

const MOCK_LOGS = [
    {
        id: "LOG-8829",
        timestamp: "2024-02-15 14:22:10",
        type: "Role Assigned",
        user: "Alexander Wright",
        role: "Super Admin",
        target: "Robert Chen",
        institute: "Stanford Technical",
        ip: "192.168.1.45",
        severity: "Info",
        status: "Success",
        details: { before: { role: "Faculty" }, after: { role: "HOD" } },
    },
    {
        id: "LOG-8830",
        timestamp: "2024-02-15 15:05:44",
        type: "Login Failure",
        user: "Unknown",
        role: "N/A",
        target: "s.jenkins@oxford.edu",
        institute: "Oxford International",
        ip: "45.22.11.90",
        severity: "Warning",
        status: "Failed",
        details: { reason: "Invalid Password", attempts: 3 },
    },
    {
        id: "LOG-8831",
        timestamp: "2024-02-15 16:12:01",
        type: "Permission Modified",
        user: "Alexander Wright",
        role: "Super Admin",
        target: "System Policy",
        institute: "Global HQ",
        ip: "192.168.1.45",
        severity: "Critical",
        status: "Success",
        details: {
            before: { manage_billing: false },
            after: { manage_billing: true },
        },
    },
    {
        id: "LOG-8832",
        timestamp: "2024-02-15 16:45:30",
        type: "Institute Created",
        user: "Sarah Jenkins",
        role: "Principal",
        target: "New Age Academy",
        institute: "Global HQ",
        ip: "88.102.34.12",
        severity: "Info",
        status: "Success",
        details: { name: "New Age Academy", tier: "Premium" },
    },
    {
        id: "LOG-8833",
        timestamp: "2024-02-15 17:00:12",
        type: "Account Suspended",
        user: "Alexander Wright",
        role: "Super Admin",
        target: "Elena Rodriguez",
        institute: "Berlin Academy",
        ip: "192.168.1.45",
        severity: "Warning",
        status: "Success",
        details: { reason: "Policy Violation" },
    },
];

const KPI_STATS = [
    {
        label: "Total Events",
        value: "24,810",
        trend: "+12%",
        icon: Activity,
        color: "text-blue-600",
    },
    {
        label: "Security Alerts",
        value: "142",
        trend: "-5%",
        icon: ShieldAlert,
        color: "text-rose-600",
    },
    {
        label: "Role Changes",
        value: "34",
        trend: "+2",
        icon: Settings,
        color: "text-purple-600",
    },
    {
        label: "Failed Logins",
        value: "89",
        trend: "+18%",
        icon: LogIn,
        color: "text-amber-600",
    },
];

const AuditLogs = () => {
    const [selectedLog, setSelectedLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                <div className="flex flex-col">
                    <Breadcrumbs
                        separator={<ChevronRight size={12} />}
                        className="mb-1"
                    >
                        <Link
                            underline="hover"
                            color="inherit"
                            href="#"
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                        >
                            Dashboard
                        </Link>
                        <Link
                            underline="hover"
                            color="inherit"
                            href="#"
                            className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                        >
                            System
                        </Link>
                        <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                            Audit Logs
                        </Typography>
                    </Breadcrumbs>
                    <h1 className="text-xl font-black text-slate-900">
                        Audit Logs
                    </h1>
                    <p className="text-[11px] text-slate-500 font-medium">
                        Monitor all system-level activities and security events
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outlined"
                        startIcon={<Download size={16} />}
                        className="!border-slate-200 !text-slate-700 !rounded-xl !normal-case !font-bold !text-xs !px-4"
                    >
                        Export Logs
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<RefreshCcw size={16} />}
                        className="!bg-slate-900 !text-white !rounded-xl !normal-case !font-bold !text-xs !px-4 !shadow-none"
                    >
                        Refresh
                    </Button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {KPI_STATS.map((kpi, i) => (
                        <div
                            key={i}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`p-2.5 rounded-xl bg-slate-50 ${kpi.color}`}
                                >
                                    <kpi.icon size={20} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span
                                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${kpi.trend.includes("+") && kpi.label === "Security Alerts" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                                    >
                                        {kpi.trend}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                                        Last 30 Days
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {kpi.label}
                            </p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                {kpi.value}
                            </h3>
                        </div>
                    ))}
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                    <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                        <ShieldAlert size={20} />
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight">
                            Security Alert: Suspicious Activity Detected
                        </h4>
                        <p className="text-xs text-rose-700 font-medium mt-1">
                            Multiple failed login attempts from IP 45.22.11.90
                            targeting administrative accounts. Action
                            recommended.
                        </p>
                    </div>
                    <Button
                        variant="contained"
                        className="!bg-rose-600 !text-white !rounded-lg !text-[10px] !font-black !px-4 !shadow-none hover:!bg-rose-700"
                    >
                        Investigate
                    </Button>
                </div>

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
                                    placeholder="Search user, action, IP or entity ID..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none">
                                <option>All Event Types</option>
                                <option>User Created</option>
                                <option>Role Assigned</option>
                                <option>Security Failure</option>
                            </select>
                            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none">
                                <option>Severity: All</option>
                                <option>Critical Only</option>
                                <option>Warnings</option>
                            </select>
                            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
                                <Calendar
                                    size={14}
                                    className="text-slate-500"
                                />
                                <span className="text-xs font-bold text-slate-700">
                                    Feb 01 - Feb 15
                                </span>
                            </div>
                            <Button
                                startIcon={<Filter size={16} />}
                                className="!text-slate-600 !normal-case !font-bold !text-xs"
                            >
                                More Filters
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
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
                                        Target Entity
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
                                {MOCK_LOGS.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">
                                                    {
                                                        log.timestamp.split(
                                                            " ",
                                                        )[0]
                                                    }
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {
                                                        log.timestamp.split(
                                                            " ",
                                                        )[1]
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${log.status === "Success" ? "bg-emerald-500" : "bg-rose-500"}`}
                                                />
                                                <span className="text-xs font-black text-slate-800">
                                                    {log.type}
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
                                                    {log.user.charAt(0)}
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {log.user}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                        {log.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase text-[10px]">
                                                {log.target}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">
                                                    {log.institute}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Globe size={10} /> {log.ip}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 w-fit ${SEVERITY_CONFIG[log.severity]?.color}`}
                                            >
                                                {React.createElement(
                                                    SEVERITY_CONFIG[
                                                        log.severity
                                                    ]?.icon,
                                                    { size: 10 },
                                                )}
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="small"
                                                onClick={() =>
                                                    setSelectedLog(log)
                                                }
                                                className="!text-[10px] !font-black !text-slate-900 hover:!bg-slate-100 !rounded-lg !px-3"
                                            >
                                                Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Page 1 of 420
                        </span>
                        <Pagination count={10} size="small" shape="rounded" />
                    </div>
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
                                    {selectedLog.id}
                                </p>
                            </div>
                            <IconButton
                                onClick={() => setSelectedLog(null)}
                                className="hover:rotate-90 transition-transform"
                            >
                                <X size={20} />
                            </IconButton>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/30">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                        Status & Severity
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${selectedLog.status === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                                        >
                                            {selectedLog.status}
                                        </span>
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${SEVERITY_CONFIG[selectedLog.severity]?.color}`}
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
                                        <Clock size={14} />{" "}
                                        {selectedLog.timestamp}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                                    Actor Identity
                                </h4>
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: "slate.900",
                                                fontWeight: 900,
                                            }}
                                        >
                                            {selectedLog.user.charAt(0)}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {selectedLog.user}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-bold uppercase">
                                                {selectedLog.role}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        className="!rounded-lg !text-[10px] !font-black !normal-case !border-slate-200 !text-slate-900"
                                    >
                                        View Profile
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Digital Footprint
                                    </h4>
                                    <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Globe
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700">
                                                {selectedLog.ip}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Monitor
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700">
                                                Chrome 121.0.0 (MacOS)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700">
                                                London, United Kingdom
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Entity Target
                                    </h4>
                                    <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Building2
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700">
                                                {selectedLog.institute}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UserCheck
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700">
                                                {selectedLog.target}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Key
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span className="text-[11px] font-bold text-slate-700">
                                                EntityID:{" "}
                                                {Math.random()
                                                    .toString(36)
                                                    .substr(2, 9)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        State Delta (JSON)
                                    </h4>
                                    <IconButton
                                        size="small"
                                        className="text-slate-400 hover:text-slate-900"
                                    >
                                        <Copy size={16} />
                                    </IconButton>
                                </div>
                                <div className="bg-slate-900 rounded-2xl p-6 font-mono text-[11px] leading-relaxed shadow-inner overflow-x-auto">
                                    <div className="flex gap-8">
                                        <div className="space-y-1 min-w-[200px]">
                                            <span className="text-rose-400 block mb-2 font-bold uppercase tracking-widest text-[9px]">
                                                Before
                                            </span>
                                            <pre className="text-rose-200/60">
                                                {JSON.stringify(
                                                    selectedLog.details
                                                        .before || {},
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </div>
                                        <div className="w-px bg-slate-800" />
                                        <div className="space-y-1 min-w-[200px]">
                                            <span className="text-emerald-400 block mb-2 font-bold uppercase tracking-widest text-[9px]">
                                                After
                                            </span>
                                            <pre className="text-emerald-200">
                                                {JSON.stringify(
                                                    selectedLog.details.after ||
                                                        selectedLog.details,
                                                    null,
                                                    2,
                                                )}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-3">
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<FileJson size={18} />}
                                    className="!bg-slate-900 !text-white !rounded-xl !py-3 !font-black !shadow-none"
                                >
                                    Download JSON Audit
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<ExternalLink size={18} />}
                                    className="!border-slate-200 !text-slate-900 !rounded-xl !py-3 !font-black"
                                >
                                    Open Resource
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
