import React, { useState } from "react";
import {
    Avatar,
    IconButton,
    Button,
    Badge,
    Tooltip,
    Breadcrumbs,
    Link,
    Typography,
    Divider,
    Tabs,
    Tab,
    Chip,
} from "@mui/material";
import {
    Bell,
    CheckCheck,
    MoreVertical,
    Trash2,
    Filter,
    ChevronRight,
    ShieldAlert,
    UserPlus,
    Info,
    Building2,
    Calendar,
    Search,
    Settings,
    Circle,
    Clock,
} from "lucide-react";

interface Notification {
    id: string;
    type: "security" | "user" | "system" | "institute";
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    priority: "low" | "medium" | "high";
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "security",
        title: "New Login Detected",
        message:
            "A new login was recorded from Chrome on MacOS (IP: 192.168.1.45). If this wasn't you, please change your password.",
        time: "2 mins ago",
        isRead: false,
        priority: "high",
    },
    {
        id: "2",
        type: "user",
        title: "New Faculty Request",
        message:
            "Dr. Sarah Smith has requested to join the Computer Science department.",
        time: "45 mins ago",
        isRead: false,
        priority: "medium",
    },
    {
        id: "3",
        type: "institute",
        title: "Monthly Audit Ready",
        message:
            'The February financial audit report for "Stanford Technical" is now available for review.',
        time: "3 hours ago",
        isRead: true,
        priority: "low",
    },
    {
        id: "4",
        type: "system",
        title: "Maintenance Update",
        message:
            "Scheduled system maintenance will begin at 02:00 AM EST this Sunday.",
        time: "1 day ago",
        isRead: true,
        priority: "medium",
    },
];

const Notifications: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [notifications, setNotifications] =
        useState<Notification[]>(MOCK_NOTIFICATIONS);

    const getIcon = (type: string) => {
        switch (type) {
            case "security":
                return <ShieldAlert size={18} className="text-rose-500" />;
            case "user":
                return <UserPlus size={18} className="text-blue-500" />;
            case "institute":
                return <Building2 size={18} className="text-amber-500" />;
            default:
                return <Info size={18} className="text-slate-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-rose-50 text-rose-600 border-rose-100";
            case "medium":
                return "bg-amber-50 text-amber-600 border-amber-100";
            default:
                return "bg-slate-50 text-slate-500 border-slate-100";
        }
    };

    const markAllRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    };

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
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
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Notifications
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            Notifications
                            {notifications.filter((n) => !n.isRead).length >
                                0 && (
                                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded-full">
                                    {
                                        notifications.filter((n) => !n.isRead)
                                            .length
                                    }{" "}
                                    New
                                </span>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="text"
                            startIcon={<CheckCheck size={16} />}
                            onClick={markAllRead}
                            className="!text-slate-600 !normal-case !font-bold !text-xs"
                        >
                            Mark all as read
                        </Button>
                        <IconButton className="!bg-white !border !border-slate-200 !rounded-xl">
                            <Settings size={18} className="text-slate-600" />
                        </IconButton>
                    </div>
                </div>

                <div className="px-8 border-t border-slate-100 flex items-center justify-between">
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#0F172A",
                                height: 3,
                            },
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 800,
                                fontSize: "13px",
                                color: "#64748B",
                                minHeight: "48px",
                                "&.Mui-selected": { color: "#0F172A" },
                            },
                        }}
                    >
                        <Tab label="All" />
                        <Tab label="Unread" />
                        <Tab label="Security" />
                        <Tab label="Requests" />
                        <Tab label="Archived" />
                    </Tabs>

                    <div className="flex items-center gap-4 py-2">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                placeholder="Search alerts..."
                                className="bg-slate-100 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-slate-900 outline-none w-48"
                            />
                        </div>
                        <IconButton size="small">
                            <Filter size={16} className="text-slate-500" />
                        </IconButton>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-[1000px] mx-auto pb-24">
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`group flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                                notif.isRead
                                    ? "bg-white border-slate-100 opacity-80 hover:opacity-100"
                                    : "bg-white border-slate-200 shadow-sm ring-1 ring-slate-200/50"
                            }`}
                        >
                            <div className="shrink-0 pt-1">
                                <div
                                    className={`p-3 rounded-xl ${notif.isRead ? "bg-slate-50" : "bg-slate-100"}`}
                                >
                                    {getIcon(notif.type)}
                                </div>
                            </div>

                            <div className="flex-grow space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3
                                            className={`text-sm ${notif.isRead ? "font-bold text-slate-600" : "font-black text-slate-900"}`}
                                        >
                                            {notif.title}
                                        </h3>
                                        {!notif.isRead && (
                                            <Circle
                                                size={8}
                                                fill="currentColor"
                                                className="text-blue-500"
                                            />
                                        )}
                                        <Chip
                                            label={notif.priority}
                                            size="small"
                                            className={`!text-[9px] !font-black !uppercase !h-5 !px-1 border ${getPriorityColor(notif.priority)}`}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                        <Clock size={12} /> {notif.time}
                                    </span>
                                </div>

                                <p
                                    className={`text-xs leading-relaxed ${notif.isRead ? "text-slate-500 font-medium" : "text-slate-700 font-semibold"}`}
                                >
                                    {notif.message}
                                </p>

                                <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:underline">
                                        View Details
                                    </button>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                                        Archive
                                    </button>
                                    {!notif.isRead && (
                                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0 flex flex-col justify-between items-end">
                                <IconButton size="small">
                                    <MoreVertical
                                        size={16}
                                        className="text-slate-400"
                                    />
                                </IconButton>
                            </div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-black">
                                All caught up!
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">
                                No new notifications at this time.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <Button
                        variant="outlined"
                        className="!border-slate-200 !text-slate-500 !font-black !text-[10px] !uppercase !tracking-widest !rounded-xl"
                    >
                        Load Older Notifications
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default Notifications;
