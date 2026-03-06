import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import {
    Users,
    Building2,
    FileText,
    AlertTriangle,
    Plus,
    Trash2,
    CheckCircle2,
    Download,
    ShieldAlert,
    RefreshCcw,
} from "lucide-react";
import {
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    CartesianGrid,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { useGetSessionAnalyticsQuery } from "../../services/academicSession/academicSession.service";
import { useGetAllInstitutesQuery } from "../../services/institute/institute.service";
import {
    useCreateNotificationMutation,
    useGetNotificationsQuery,
    type NotificationPriority,
    type NotificationType,
} from "../../services/notification/notification.service";
import { useGetAllUsersQuery } from "../../services/user/user.service";

type TodoItem = {
    id: number;
    text: string;
    completed: boolean;
};

type SessionStatus = "upcoming" | "active" | "locked" | "completed";

type BroadcastForm = {
    recipient: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
};

const TODO_STORAGE_KEY = "admin_dashboard_todos_v1";

const DEFAULT_TODOS: TodoItem[] = [
    { id: 1, text: "Verify newly onboarded institutes", completed: false },
    { id: 2, text: "Review unread security notifications", completed: false },
    { id: 3, text: "Audit suspended user accounts", completed: true },
];

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
    upcoming: "Upcoming",
    active: "Active",
    locked: "Locked",
    completed: "Completed",
};

const defaultBroadcastForm = (): BroadcastForm => ({
    recipient: "",
    type: "security",
    priority: "high",
    title: "",
    message: "",
});

const loadStoredTodos = (): TodoItem[] => {
    if (typeof window === "undefined") return DEFAULT_TODOS;
    try {
        const stored = window.localStorage.getItem(TODO_STORAGE_KEY);
        if (!stored) return DEFAULT_TODOS;
        const parsed = JSON.parse(stored) as TodoItem[];
        if (!Array.isArray(parsed)) return DEFAULT_TODOS;
        return parsed.filter(
            (item) =>
                typeof item.id === "number" &&
                typeof item.text === "string" &&
                typeof item.completed === "boolean",
        );
    } catch {
        return DEFAULT_TODOS;
    }
};

const AdminDashboard = () => {
    const [todos, setTodos] = useState<TodoItem[]>(() => loadStoredTodos());
    const [newTodo, setNewTodo] = useState("");
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>(defaultBroadcastForm());
    const [broadcastError, setBroadcastError] = useState("");

    const {
        data: usersData,
        isFetching: usersFetching,
        isError: usersError,
        refetch: refetchUsers,
    } = useGetAllUsersQuery({ page: 1, limit: 100 });

    const {
        data: institutesData,
        isFetching: institutesFetching,
        isError: institutesError,
        refetch: refetchInstitutes,
    } = useGetAllInstitutesQuery({ page: 1, limit: 1 });

    const {
        data: sessionsData,
        isFetching: sessionsFetching,
        isError: sessionsError,
        refetch: refetchSessions,
    } = useGetSessionAnalyticsQuery();

    const {
        data: securityAlertsData,
        isFetching: securityAlertsFetching,
        isError: securityAlertsError,
        refetch: refetchSecurityAlerts,
    } = useGetNotificationsQuery({
        type: "security",
        isRead: false,
        isArchived: false,
        page: 1,
        limit: 1,
    });

    const [createNotification, { isLoading: sendingBroadcast }] = useCreateNotificationMutation();

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    const users = usersData?.data ?? [];
    const userStats = usersData?.stats ?? {};
    const totalStudents = userStats.student ?? 0;
    const totalUsers = Object.values(userStats).reduce((sum, n) => sum + n, 0);
    const totalInstitutes = institutesData?.pagination?.total ?? 0;
    const activeSessions = sessionsData?.stats?.active?.count ?? 0;
    const securityAlerts = securityAlertsData?.pagination?.total ?? 0;

    const statusChartData = useMemo(() => {
        const statuses: SessionStatus[] = ["upcoming", "active", "locked", "completed"];
        return statuses.map((status) => ({
            status: SESSION_STATUS_LABELS[status],
            count: sessionsData?.stats?.[status]?.count ?? 0,
        }));
    }, [sessionsData?.stats]);

    const stats = [
        {
            title: "Total Students",
            value: totalStudents.toLocaleString(),
            icon: Users,
            trend: totalUsers > 0 ? `${Math.round((totalStudents / totalUsers) * 100)}% users` : "0% users",
        },
        {
            title: "Institutes",
            value: totalInstitutes.toLocaleString(),
            icon: Building2,
            trend: "Registered",
        },
        {
            title: "Active Sessions",
            value: activeSessions.toLocaleString(),
            icon: FileText,
            trend: activeSessions > 0 ? "Live" : "Idle",
        },
        {
            title: "Security Alerts",
            value: securityAlerts.toLocaleString(),
            icon: AlertTriangle,
            trend: securityAlerts > 0 ? "High" : "Clear",
        },
    ];

    const isLoadingDashboard = usersFetching || institutesFetching || sessionsFetching || securityAlertsFetching;
    const hasDashboardError = usersError || institutesError || sessionsError || securityAlertsError;

    const addTodo = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        setTodos((prev) => [{ id: Date.now(), text: newTodo.trim(), completed: false }, ...prev]);
        setNewTodo("");
    };

    const toggleTodo = (id: number) => {
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    };

    const deleteTodo = (id: number) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
    };

    const clearFinished = () => {
        setTodos((prev) => prev.filter((t) => !t.completed));
    };

    const refreshDashboard = async () => {
        await Promise.all([
            refetchUsers(),
            refetchInstitutes(),
            refetchSessions(),
            refetchSecurityAlerts(),
        ]);
    };

    const exportDashboardData = () => {
        const payload = {
            exportedAt: new Date().toISOString(),
            summary: {
                totalUsers,
                totalStudents,
                totalInstitutes,
                activeSessions,
                unreadSecurityAlerts: securityAlerts,
            },
            sessionStatusDistribution: statusChartData,
            pendingTasks: todos.filter((t) => !t.completed),
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `admin-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const openBroadcastModal = () => {
        setBroadcastError("");
        setBroadcastForm(defaultBroadcastForm());
        setIsBroadcastOpen(true);
    };

    const handleBroadcastSubmit = async () => {
        if (!broadcastForm.recipient || !broadcastForm.title.trim() || !broadcastForm.message.trim()) {
            setBroadcastError("Recipient, title, and message are required.");
            return;
        }

        try {
            await createNotification({
                recipient: broadcastForm.recipient,
                type: broadcastForm.type,
                priority: broadcastForm.priority,
                title: broadcastForm.title.trim(),
                message: broadcastForm.message.trim(),
            }).unwrap();
            setTodos((prev) => [
                {
                    id: Date.now(),
                    text: `Track acknowledgement for "${broadcastForm.title.trim()}"`,
                    completed: false,
                },
                ...prev,
            ]);
            setIsBroadcastOpen(false);
        } catch (error: any) {
            setBroadcastError(error?.data?.message ?? "Unable to send alert. Please verify recipient and try again.");
        }
    };

    return (
        <div className="w-full bg-(--bg-base) min-h-screen font-sans">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            System Overview
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Global administrative control panel and live monitoring.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<Download size={16} />}
                            onClick={exportDashboardData}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "var(--ui-border)",
                                color: "var(--text-primary)",
                                "&:hover": {
                                    borderColor: "var(--brand-primary)",
                                    bgcolor: "var(--brand-active)",
                                },
                            }}
                        >
                            Export
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={
                                isLoadingDashboard ? (
                                    <CircularProgress size={16} sx={{ color: "var(--text-primary)" }} />
                                ) : (
                                    <RefreshCcw size={16} />
                                )
                            }
                            onClick={refreshDashboard}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "var(--ui-border)",
                                color: "var(--text-primary)",
                                "&:hover": {
                                    borderColor: "var(--brand-primary)",
                                    bgcolor: "var(--brand-active)",
                                },
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<ShieldAlert size={16} />}
                            onClick={openBroadcastModal}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "var(--brand-primary)",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" },
                            }}
                        >
                            Broadcast
                        </Button>
                    </div>
                </div>

                {hasDashboardError && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: "8px", fontWeight: 600 }}>
                        Some dashboard data failed to load. Use refresh to retry.
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.title}
                                className="p-5 bg-(--bg-surface) border border-(--ui-border) rounded-xl hover:border-(--brand-primary) transition-colors shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)]">
                                        <Icon size={20} className="text-(--brand-primary)" />
                                    </div>
                                    <span
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${stat.trend === "Live" || stat.trend === "High" ? "bg-(--status-danger)/10 text-(--status-danger)" : "bg-(--brand-primary)/10 text-(--brand-primary)"}`}
                                    >
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-(--text-primary) tracking-tight">
                                    {isLoadingDashboard ? "..." : stat.value}
                                </h3>
                                <p className="text-xs font-semibold text-(--text-secondary) mt-1">
                                    {stat.title}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-(--bg-surface) border border-(--ui-border) rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-base font-bold text-(--text-primary)">
                                    Academic Session Status
                                </h2>
                                <p className="text-xs font-medium text-(--text-secondary) mt-1">
                                    Distribution of sessions by lifecycle state
                                </p>
                            </div>
                            <div className="px-2.5 py-1 bg-[var(--bg-base)] rounded-md border border-(--ui-border) flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-(--status-danger) animate-pulse" />
                                <span className="text-[10px] font-bold text-(--text-primary) tracking-wider uppercase">
                                    Live
                                </span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer>
                                <AreaChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ui-divider)" />
                                    <XAxis
                                        dataKey="status"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "var(--bg-surface)",
                                            borderRadius: "8px",
                                            border: "1px solid var(--ui-border)",
                                            color: "var(--text-primary)",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        itemStyle={{ color: "var(--brand-primary)" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--brand-primary)"
                                        strokeWidth={3}
                                        fill="url(#chartGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-(--bg-surface) border border-(--ui-border) rounded-xl p-6 flex flex-col shadow-sm">
                        <h2 className="text-base font-bold text-(--text-primary) mb-5">
                            Priority Tasks
                        </h2>

                        <form onSubmit={addTodo} className="relative mb-5">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                placeholder="Quick task add..."
                                className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-(--text-primary) focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-all placeholder:text-(--text-secondary)/60"
                            />
                            <button
                                title="submit"
                                type="submit"
                                className="absolute right-1.5 top-1.5 p-1 bg-(--brand-primary) text-white rounded-md hover:bg-(--bg-sidebar) transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </form>

                        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[240px] pr-1 custom-scrollbar">
                            {todos.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-(--text-secondary) opacity-60">
                                    <CheckCircle2 size={28} className="mb-2" />
                                    <p className="text-xs font-semibold">Queue empty</p>
                                </div>
                            ) : (
                                todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all group ${todo.completed ? "bg-[var(--bg-base)] border-transparent" : "bg-(--bg-surface) border-(--ui-border)"}`}
                                    >
                                        <Checkbox
                                            size="small"
                                            checked={todo.completed}
                                            onChange={() => toggleTodo(todo.id)}
                                            sx={{
                                                p: 0,
                                                mt: 0.25,
                                                color: "var(--ui-border)",
                                                "&.Mui-checked": { color: "var(--brand-primary)" },
                                            }}
                                        />
                                        <span
                                            className={`text-sm font-medium flex-1 leading-tight transition-all ${todo.completed ? "line-through text-(--text-secondary) opacity-60" : "text-(--text-primary)"}`}
                                        >
                                            {todo.text}
                                        </span>
                                        <IconButton
                                            size="small"
                                            onClick={() => deleteTodo(todo.id)}
                                            sx={{ p: 0.5, color: "var(--status-danger)", opacity: 0, transition: "opacity 0.2s" }}
                                            className="group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-(--ui-divider) flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-(--text-secondary)">
                            <span>{todos.filter((t) => !t.completed).length} Pending</span>
                            <button onClick={clearFinished} className="text-(--status-danger) hover:text-red-700 transition-colors">
                                Clear Done
                            </button>
                        </div>
                    </div>
                </div>

                <Dialog
                    open={isBroadcastOpen}
                    onClose={() => setIsBroadcastOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 2, fontSize: "1.125rem" }}>
                        Broadcast System Alert
                    </DialogTitle>
                    <DialogContent sx={{ px: 3, pb: 1 }}>
                        <div className="space-y-4 pt-1">
                            {broadcastError && <Alert severity="error" sx={{ borderRadius: "8px" }}>{broadcastError}</Alert>}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text-secondary)">Recipient</label>
                                <select
                                    title="recipient"
                                    value={broadcastForm.recipient}
                                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, recipient: e.target.value }))}
                                    className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-(--brand-primary) focus:ring-1 focus:ring-(--brand-primary)"
                                >
                                    <option value="">Select Target User</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text-secondary)">Alert Type</label>
                                    <select
                                        title="type"
                                        value={broadcastForm.type}
                                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, type: e.target.value as NotificationType }))}
                                        className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-(--brand-primary) focus:ring-1 focus:ring-(--brand-primary)"
                                    >
                                        <option value="security">Security</option>
                                        <option value="system">System</option>
                                        <option value="user">User</option>
                                        <option value="institute">Institute</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text-secondary)">Priority Level</label>
                                    <select
                                        title="priority"
                                        value={broadcastForm.priority}
                                        onChange={(e) => setBroadcastForm((prev) => ({ ...prev, priority: e.target.value as NotificationPriority }))}
                                        className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-(--brand-primary) focus:ring-1 focus:ring-(--brand-primary)"
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text-secondary)">Subject line</label>
                                <input
                                    type="text"
                                    value={broadcastForm.title}
                                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Brief alert title"
                                    className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-(--brand-primary) focus:ring-1 focus:ring-(--brand-primary)"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text-secondary)">Detailed Message</label>
                                <textarea
                                    value={broadcastForm.message}
                                    onChange={(e) => setBroadcastForm((prev) => ({ ...prev, message: e.target.value }))}
                                    placeholder="Provide necessary context..."
                                    rows={3}
                                    className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-(--brand-primary) focus:ring-1 focus:ring-(--brand-primary) resize-none"
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                        <Button
                            onClick={() => setIsBroadcastOpen(false)}
                            sx={{ fontWeight: 600, color: "var(--text-secondary)", textTransform: "none" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleBroadcastSubmit}
                            disabled={sendingBroadcast}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "var(--brand-primary)",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" }
                            }}
                        >
                            {sendingBroadcast ? "Transmitting..." : "Dispatch Alert"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminDashboard;