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
    const [broadcastForm, setBroadcastForm] =
        useState<BroadcastForm>(defaultBroadcastForm());
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
    const [createNotification, { isLoading: sendingBroadcast }] =
        useCreateNotificationMutation();

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
        const statuses: SessionStatus[] = [
            "upcoming",
            "active",
            "locked",
            "completed",
        ];
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
            trend:
                totalUsers > 0
                    ? `${Math.round((totalStudents / totalUsers) * 100)}% users`
                    : "0% users",
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

    const isLoadingDashboard =
        usersFetching ||
        institutesFetching ||
        sessionsFetching ||
        securityAlertsFetching;
    const hasDashboardError =
        usersError || institutesError || sessionsError || securityAlertsError;

    const addTodo = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        setTodos((prev) => [
            { id: Date.now(), text: newTodo.trim(), completed: false },
            ...prev,
        ]);
        setNewTodo("");
    };

    const toggleTodo = (id: number) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        );
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

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });
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
        if (
            !broadcastForm.recipient ||
            !broadcastForm.title.trim() ||
            !broadcastForm.message.trim()
        ) {
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
            setBroadcastError(
                error?.data?.message ??
                    "Unable to send alert. Please verify recipient and try again.",
            );
        }
    };

    return (
        <div className="grow bg-(--bg-base) min-h-screen font-sans">
            <div className="p-8 max-w-400 mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            System Overview
                        </h1>
                        <p className="text-(--text-secondary) mt-1">
                            Global administrative control panel and live
                            monitoring.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<Download size={18} />}
                            onClick={exportDashboardData}
                            sx={{
                                borderRadius: "12px",
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
                            Export Data
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={
                                isLoadingDashboard ? (
                                    <CircularProgress
                                        size={16}
                                        sx={{ color: "var(--text-primary)" }}
                                    />
                                ) : (
                                    <RefreshCcw size={18} />
                                )
                            }
                            onClick={refreshDashboard}
                            sx={{
                                borderRadius: "12px",
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
                            startIcon={<ShieldAlert size={18} />}
                            onClick={openBroadcastModal}
                            sx={{
                                borderRadius: "12px",
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "var(--brand-primary)",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "var(--bg-sidebar)" },
                            }}
                        >
                            Broadcast Alert
                        </Button>
                    </div>
                </div>

                {hasDashboardError && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3, borderRadius: "12px", fontWeight: 700 }}
                    >
                        Some dashboard data failed to load. Use refresh to retry.
                    </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.title}
                                className="p-6 bg-(--bg-surface) border border-(--ui-border) rounded-2xl hover:border-(--brand-primary) transition-all group shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-(--bg-base) group-hover:bg-(--brand-active) transition-colors">
                                        <Icon
                                            size={24}
                                            className="text-(--brand-primary)"
                                        />
                                    </div>
                                    <span
                                        className={`text-[10px] font-black px-2 py-1 rounded-md tracking-tighter uppercase ${stat.trend === "Live" || stat.trend === "High" ? "bg-(--status-danger)/10 text-(--status-danger)" : "bg-(--brand-primary)/10 text-(--brand-primary)"}`}
                                    >
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-(--text-primary)">
                                    {isLoadingDashboard ? "..." : stat.value}
                                </h3>
                                <p className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-widest mt-1">
                                    {stat.title}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-(--bg-surface) border border-(--ui-border) rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-(--text-primary)">
                                    Academic Session Status
                                </h2>
                                <p className="text-xs text-(--text-secondary)">
                                    Distribution of sessions by lifecycle state
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-(--bg-base) rounded-full border border-(--ui-border) flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-(--status-danger) animate-pulse" />
                                <span className="text-[10px] font-bold text-(--text-primary)">
                                    LIVE FEED
                                </span>
                            </div>
                        </div>
                        <div className="h-85 w-full">
                            <ResponsiveContainer>
                                <AreaChart data={statusChartData}>
                                    <defs>
                                        <linearGradient
                                            id="chartGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="var(--brand-primary)"
                                                stopOpacity={0.2}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--brand-primary)"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="var(--ui-divider)"
                                    />
                                    <XAxis
                                        dataKey="status"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "var(--text-secondary)",
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "var(--text-secondary)",
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor:
                                                "var(--bg-surface)",
                                            borderRadius: "12px",
                                            border: "1px solid var(--ui-border)",
                                            color: "var(--text-primary)",
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="var(--brand-primary)"
                                        strokeWidth={4}
                                        fill="url(#chartGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-(--bg-surface) border border-(--ui-border) rounded-2xl p-6 flex flex-col shadow-sm">
                        <h2 className="text-lg font-bold text-(--text-primary) mb-6">
                            Task Priority Queue
                        </h2>

                        <form onSubmit={addTodo} className="relative mb-6">
                            <input
                                type="text"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                placeholder="Assign new task..."
                                className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl pl-4 pr-12 py-3 text-sm text-(--text-primary) focus:ring-1 focus:ring-(--brand-primary) outline-none transition-all placeholder:text-(--text-secondary)/50"
                            />
                            <button
                                title="submit"
                                type="submit"
                                className="absolute right-2 top-1.5 p-1.5 bg-(--brand-primary) text-(--bg-base) rounded-lg hover:bg-(--bg-sidebar) transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </form>

                        <div className="grow space-y-3 overflow-y-auto max-h-85 pr-2 custom-scrollbar">
                            {todos.length === 0 ? (
                                <div className="text-center py-12 text-(--text-secondary) flex flex-col items-center opacity-40">
                                    <CheckCircle2 size={32} className="mb-2" />
                                    <p className="text-sm font-medium">
                                        All tasks cleared
                                    </p>
                                </div>
                            ) : (
                                todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${todo.completed ? "bg-(--bg-base) border-transparent" : "bg-(--bg-surface) border-(--ui-border) shadow-sm"}`}
                                    >
                                        <Checkbox
                                            size="small"
                                            checked={todo.completed}
                                            onChange={() => toggleTodo(todo.id)}
                                            sx={{
                                                p: 0,
                                                color: "var(--ui-border)",
                                                "&.Mui-checked": {
                                                    color: "var(--brand-primary)",
                                                },
                                            }}
                                        />
                                        <span
                                            className={`text-sm font-semibold grow transition-all ${todo.completed ? "line-through text-(--text-secondary) opacity-50" : "text-(--text-primary)"}`}
                                        >
                                            {todo.text}
                                        </span>
                                        <IconButton
                                            size="small"
                                            onClick={() => deleteTodo(todo.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-(--status-danger)"
                                        >
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-(--ui-divider) flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-(--text-secondary)">
                            <span>
                                {todos.filter((t) => !t.completed).length}{" "}
                                Pending
                            </span>
                            <button
                                onClick={clearFinished}
                                className="text-(--status-danger) hover:underline transition-all"
                            >
                                Clear Finished
                            </button>
                        </div>
                    </div>
                </div>

                <Dialog
                    open={isBroadcastOpen}
                    onClose={() => setIsBroadcastOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: "20px" } }}
                >
                    <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>
                        Broadcast Alert
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 2 }}>
                        <div className="space-y-4 pt-2">
                            {broadcastError && (
                                <Alert severity="error">{broadcastError}</Alert>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                    Recipient
                                </label>
                                <select
                                    title="recipient"
                                    value={broadcastForm.recipient}
                                    onChange={(e) =>
                                        setBroadcastForm((prev) => ({
                                            ...prev,
                                            recipient: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm outline-none"
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName} (
                                            {user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Type
                                    </label>
                                    <select
                                        title="type"
                                        value={broadcastForm.type}
                                        onChange={(e) =>
                                            setBroadcastForm((prev) => ({
                                                ...prev,
                                                type: e.target
                                                    .value as NotificationType,
                                            }))
                                        }
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm outline-none"
                                    >
                                        <option value="security">Security</option>
                                        <option value="system">System</option>
                                        <option value="user">User</option>
                                        <option value="institute">
                                            Institute
                                        </option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Priority
                                    </label>
                                    <select
                                        title="priority"
                                        value={broadcastForm.priority}
                                        onChange={(e) =>
                                            setBroadcastForm((prev) => ({
                                                ...prev,
                                                priority: e.target
                                                    .value as NotificationPriority,
                                            }))
                                        }
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm outline-none"
                                    >
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={broadcastForm.title}
                                    onChange={(e) =>
                                        setBroadcastForm((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter alert title"
                                    className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--brand-primary)"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                    Message
                                </label>
                                <textarea
                                    value={broadcastForm.message}
                                    onChange={(e) =>
                                        setBroadcastForm((prev) => ({
                                            ...prev,
                                            message: e.target.value,
                                        }))
                                    }
                                    placeholder="Describe the alert details"
                                    rows={4}
                                    className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--brand-primary) resize-none"
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ px: 4, pb: 4 }}>
                        <Button
                            onClick={() => setIsBroadcastOpen(false)}
                            sx={{ fontWeight: 700, color: "var(--text-secondary)" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleBroadcastSubmit}
                            disabled={sendingBroadcast}
                            sx={{
                                borderRadius: "10px",
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "var(--brand-primary)",
                                boxShadow: "none",
                            }}
                        >
                            {sendingBroadcast ? "Sending..." : "Send Alert"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminDashboard;
