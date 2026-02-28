import { useState, useDeferredValue } from "react";
import {
    Button,
    IconButton,
    Breadcrumbs,
    Link,
    Typography,
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
    Search,
    Circle,
    Clock,
    Archive,
} from "lucide-react";
import {
    useGetNotificationsQuery,
    useMarkOneReadMutation,
    useMarkAllReadMutation,
    useArchiveOneMutation,
    useDeleteNotificationMutation,
    type GetNotificationsParams,
    type NotificationType,
} from "../../services/notification/notification.service";

// ─── Helpers (same as admin) ──────────────────────────────────────────────────
const getIcon = (type: string) => {
    switch (type) {
        case "security": return <ShieldAlert size={18} className="text-rose-500" />;
        case "user": return <UserPlus size={18} className="text-blue-500" />;
        case "institute": return <Building2 size={18} className="text-amber-500" />;
        default: return <Info size={18} className="text-slate-400" />;
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "high": return "bg-rose-50 text-rose-600 border-rose-100";
        case "medium": return "bg-amber-50 text-amber-600 border-amber-100";
        default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
};

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const TABS: { label: string; params: Partial<GetNotificationsParams> }[] = [
    { label: "All", params: {} },
    { label: "Unread", params: { isRead: false } },
    { label: "Security", params: { type: "security" as NotificationType } },
    { label: "System", params: { type: "system" as NotificationType } },
    { label: "Archived", params: { isArchived: true } },
];

const NotifSkeleton = () => (
    <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
        <div className="grow space-y-2 pt-1">
            <div className="flex justify-between">
                <div className="h-3 bg-slate-200 rounded w-48" />
                <div className="h-2 bg-slate-100 rounded w-20" />
            </div>
            <div className="h-2 bg-slate-100 rounded w-full" />
            <div className="h-2 bg-slate-100 rounded w-3/4" />
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Notifications = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const deferredSearch = useDeferredValue(search);
    const tabParams = TABS[activeTab].params;
    const queryParams: GetNotificationsParams = {
        ...tabParams,
        search: deferredSearch || undefined,
        page,
        limit: 20,
        isArchived: tabParams.isArchived ?? false,
    };

    const { data, isLoading, isFetching } = useGetNotificationsQuery(queryParams);
    const notifications = data?.data ?? [];
    const unreadCount = data?.unreadCount ?? 0;
    const pagination = data?.pagination;

    const [markOneRead] = useMarkOneReadMutation();
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
    const [archiveOne] = useArchiveOneMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const handleTabChange = (_: any, newVal: number) => {
        setActiveTab(newVal);
        setPage(1);
    };

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div className="flex flex-col">
                        <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                            <Link underline="hover" href="/principal/dashboard"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Principal
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Notifications
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded-full">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                    </div>

                    <Button
                        variant="text"
                        startIcon={<CheckCheck size={16} />}
                        onClick={() => markAllRead()}
                        disabled={isMarkingAll || unreadCount === 0}
                        className="!text-slate-600 !normal-case !font-bold !text-xs"
                    >
                        Mark all as read
                    </Button>
                </div>

                {/* Tabs + Search */}
                <div className="px-8 border-t border-slate-100 flex items-center justify-between">
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            "& .MuiTabs-indicator": { backgroundColor: "#0F172A", height: 3 },
                            "& .MuiTab-root": {
                                textTransform: "none", fontWeight: 800, fontSize: "13px",
                                color: "#64748B", minHeight: "48px",
                                "&.Mui-selected": { color: "#0F172A" },
                            },
                        }}
                    >
                        {TABS.map((tab) => <Tab key={tab.label} label={tab.label} />)}
                    </Tabs>

                    <div className="flex items-center gap-3 py-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="bg-slate-100 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-slate-900 outline-none w-44"
                            />
                        </div>
                        <IconButton size="small">
                            <Filter size={16} className="text-slate-500" />
                        </IconButton>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="p-8 max-w-[1000px] mx-auto pb-24">
                <div className="space-y-3">
                    {/* Skeletons */}
                    {isLoading && Array.from({ length: 4 }).map((_, i) => <NotifSkeleton key={i} />)}

                    {/* Notification cards */}
                    {!isLoading && notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`group flex gap-4 p-5 rounded-2xl border transition-all ${notif.isRead
                                    ? "bg-white border-slate-100 opacity-80 hover:opacity-100"
                                    : "bg-white border-slate-200 shadow-sm ring-1 ring-slate-200/50"
                                }`}
                        >
                            <div className="shrink-0 pt-1">
                                <div className={`p-3 rounded-xl ${notif.isRead ? "bg-slate-50" : "bg-slate-100"}`}>
                                    {getIcon(notif.type)}
                                </div>
                            </div>

                            <div className="grow space-y-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-sm ${notif.isRead ? "font-bold text-slate-600" : "font-black text-slate-900"}`}>
                                            {notif.title}
                                        </h3>
                                        {!notif.isRead && (
                                            <Circle size={8} fill="currentColor" className="text-blue-500 shrink-0" />
                                        )}
                                        <Chip
                                            label={notif.priority}
                                            size="small"
                                            className={`!text-[9px] !font-black !uppercase !h-5 !px-1 border ${getPriorityColor(notif.priority)}`}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase shrink-0">
                                        <Clock size={12} />
                                        {formatTime(notif.createdAt)}
                                    </span>
                                </div>

                                <p className={`text-xs leading-relaxed ${notif.isRead ? "text-slate-500 font-medium" : "text-slate-700 font-semibold"}`}>
                                    {notif.message}
                                </p>

                                {/* Hover actions */}
                                <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notif.isRead && (
                                        <button
                                            onClick={() => markOneRead(notif._id)}
                                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    {!notif.isArchived && (
                                        <button
                                            onClick={() => archiveOne(notif._id)}
                                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 flex items-center gap-1"
                                        >
                                            <Archive size={11} /> Archive
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notif._id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 flex items-center gap-1"
                                    >
                                        <Trash2 size={11} /> Delete
                                    </button>
                                </div>
                            </div>

                            <div className="shrink-0 flex flex-col justify-start items-end">
                                <IconButton size="small">
                                    <MoreVertical size={16} className="text-slate-400" />
                                </IconButton>
                            </div>
                        </div>
                    ))}

                    {/* Empty state */}
                    {!isLoading && notifications.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-black">
                                {activeTab === 4 ? "No archived notifications" : "All caught up!"}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">
                                {activeTab === 4
                                    ? "Archived items will appear here."
                                    : "No notifications match the current filter."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        {page > 1 && (
                            <Button variant="outlined" onClick={() => setPage((p) => p - 1)} disabled={isFetching}
                                className="!border-slate-200 !text-slate-500 !font-black !text-[10px] !uppercase !tracking-widest !rounded-xl">
                                ← Newer
                            </Button>
                        )}
                        <span className="text-xs font-bold text-slate-400">Page {page} of {pagination.pages}</span>
                        {page < pagination.pages && (
                            <Button variant="outlined" onClick={() => setPage((p) => p + 1)} disabled={isFetching}
                                className="!border-slate-200 !text-slate-500 !font-black !text-[10px] !uppercase !tracking-widest !rounded-xl">
                                Load Older →
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Notifications;
