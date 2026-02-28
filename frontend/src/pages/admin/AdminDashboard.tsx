import { useState } from "react";
import { IconButton, Checkbox, Button } from "@mui/material";
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

const stats = [
    { title: "Total Students", value: "8,245", icon: Users, trend: "+12%" },
    { title: "Institutes", value: "12", icon: Building2, trend: "+2" },
    { title: "Active Exams", value: "24", icon: FileText, trend: "Live" },
    {
        title: "Security Alerts",
        value: "03",
        icon: AlertTriangle,
        trend: "High",
    },
];

const activityData = [
    { time: "08:00", active: 400 },
    { time: "10:00", active: 1200 },
    { time: "12:00", active: 900 },
    { time: "14:00", active: 1500 },
    { time: "16:00", active: 1100 },
    { time: "18:00", active: 600 },
];

const AdminDashboard = () => {
    const [todos, setTodos] = useState([
        { id: 1, text: "Verify University credentials", completed: false },
        { id: 2, text: "Update proctoring AI model", completed: true },
        { id: 3, text: "Review flag on Exam #902", completed: false },
    ]);
    const [newTodo, setNewTodo] = useState("");

    const addTodo = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        setTodos([
            { id: Date.now(), text: newTodo, completed: false },
            ...todos,
        ]);
        setNewTodo("");
    };

    const toggleTodo = (id: number) => {
        setTodos(
            todos.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t,
            ),
        );
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter((t) => t.id !== id));
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
                            variant="contained"
                            startIcon={<ShieldAlert size={18} />}
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
                                        className={`text-[10px] font-black px-2 py-1 rounded-md tracking-tighter uppercase ${stat.trend === "Live" ? "bg-(--status-danger)/10 text-(--status-danger) animate-pulse" : "bg-(--brand-primary)/10 text-(--brand-primary)"}`}
                                    >
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-(--text-primary)">
                                    {stat.value}
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
                                    Network Traffic
                                </h2>
                                <p className="text-xs text-(--text-secondary)">
                                    Concurrent active examination sessions
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
                                <AreaChart data={activityData}>
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
                                        dataKey="time"
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
                                        dataKey="active"
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
                                onClick={() =>
                                    setTodos(todos.filter((t) => !t.completed))
                                }
                                className="text-(--status-danger) hover:underline transition-all"
                            >
                                Clear Finished
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
