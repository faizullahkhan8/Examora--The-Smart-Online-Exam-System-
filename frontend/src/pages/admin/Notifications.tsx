import { useState, useDeferredValue } from "react";
import {
    Button,
    IconButton,
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
    ShieldAlert,
    UserPlus,
    Info,
    Building2,
    Search,
    Settings,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getIcon = (type: string) => {
    switch (type) {
        case "security":
            return <ShieldAlert size={18} className="text-rose-500" />;
        case "user":
            return <UserPlus size={18} className="text-blue-500" />;
        case "institute":
            return <Building2 size={18} className="text-amber-500" />;
        default:
            return <Info size={18} className="text-(--text-secondary)" />;
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "high":
            return "bg-rose-50 text-rose-600 border-rose-100";
        case "medium":
            return "bg-amber-50 text-amber-600 border-amber-100";
        default:
            return "bg-(--bg-base) text-(--text-secondary) border-(--ui-border)";
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
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: {
    label: string;
    params: Partial<GetNotificationsParams>;
}[] = [
        { label: "All", params: {} },
        { label: "Unread", params: { isRead: false } },
        { label: "Security", params: { type: "security" as NotificationType } },
        { label: "Requests", params: { type: "user" as NotificationType } },
        { label: "Archived", params: { isArchived: true } },
    ];

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const NotifSkeleton = () => (
    <div className="flex gap-4 p-5 rounded-xl border border-(--ui-border) bg-(--bg-surface) animate-pulse shadow-sm">
        <div className="w-12 h-12 rounded-lg bg-(--bg-base) shrink-0 border border-(--ui-divider)" />
        <div className="grow space-y-2 pt-1">
            <div className="flex justify-between">
                <div className="h-3 bg-(--bg-base) rounded w-48" />
                <div className="h-2 bg-(--bg-base) rounded w-20" />
            </div>
            <div className="h-2 bg-(--bg-base) rounded w-full" />
            <div className="h-2 bg-(--bg-base) rounded w-3/4" />
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

    // ─── Mutations ─────────────────────────────────────────────────────────
    const [markOneRead] = useMarkOneReadMutation();
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
    const [archiveOne] = useArchiveOneMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const handleMarkAllRead = async () => {
        await markAllRead();
    };

    const handleTabChange = (_: any, newVal: number) => {
        setActiveTab(newVal);
        setPage(1);
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    return (
        <div className="w-full bg-(--bg-base) min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">
                {/* ─── Inline Header ─── */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) flex items-center gap-3 tracking-tight">
                            System Alerts
                            {unreadCount > 0 && (
                                <span className="px-2.5 py-0.5 bg-(--brand-primary) text-white text-[11px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                                    {unreadCount} New
                                </span>
                            )}
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Monitor and manage system-wide events and requests.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            startIcon={<CheckCheck size={16} />}
                            onClick={handleMarkAllRead}
                            disabled={isMarkingAll || unreadCount === 0}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "var(--ui-border)",
                                color: "var(--text-primary)",
                                "&:hover": {
                                    borderColor: "var(--brand-primary)",
                                    bgcolor: "var(--brand-active)"
                                },
                                "&.Mui-disabled": {
                                    borderColor: "var(--ui-border)",
                                    color: "var(--text-secondary)",
                                    opacity: 0.6
                                }
                            }}
                        >
                            Mark all as read
                        </Button>
                    </div>
                </div>

                {/* Tabs & Search Container */}
                <div className="mb-6 bg-(--bg-surface) border border-(--ui-border) rounded-xl p-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            minHeight: "40px",
                            "& .MuiTabs-indicator": {
                                backgroundColor: "var(--brand-primary)",
                                height: 3,
                                borderRadius: "3px",
                            },
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "13px",
                                color: "var(--text-secondary)",
                                minHeight: "40px",
                                padding: "0 16px",
                                "&.Mui-selected": { color: "var(--text-primary)" },
                            },
                        }}
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab.label} label={tab.label} />
                        ))}
                    </Tabs>

                    <div className="flex items-center gap-3 px-2 md:px-0">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                            />
                            <input
                                placeholder="Filter alerts..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="bg-(--bg-base) border border-(--ui-border) rounded-lg pl-9 pr-4 py-2 text-xs font-medium text-(--text-primary) focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none w-56 transition-all"
                            />
                        </div>
                        {/* <IconButton size="small" sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)" } }}>
                            <Filter size={16} />
                        </IconButton> */}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Loading skeletons */}
                    {isLoading &&
                        Array.from({ length: 4 }).map((_, i) => (
                            <NotifSkeleton key={i} />
                        ))}

                    {/* Notification cards */}
                    {!isLoading &&
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`group flex gap-4 p-5 rounded-xl border transition-all ${notif.isRead
                                    ? "bg-(--bg-surface) border-(--ui-border) opacity-80 hover:opacity-100"
                                    : "bg-(--bg-surface) border-(--brand-primary) shadow-sm ring-1 ring-(--brand-primary)/20"
                                    }`}
                            >
                                {/* Icon */}
                                <div className="shrink-0 pt-1">
                                    <div
                                        className={`p-2.5 rounded-lg border ${notif.isRead
                                            ? "bg-(--bg-base) border-(--ui-border)"
                                            : "bg-(--bg-base) border-(--brand-primary)/30"
                                            }`}
                                    >
                                        {getIcon(notif.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="grow space-y-1.5 min-w-0">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <h3
                                                className={`text-sm ${notif.isRead
                                                    ? "font-bold text-(--text-secondary)"
                                                    : "font-black text-(--text-primary)"
                                                    }`}
                                            >
                                                {notif.title}
                                            </h3>
                                            {!notif.isRead && (
                                                <Circle
                                                    size={8}
                                                    fill="currentColor"
                                                    className="text-(--brand-primary) shrink-0"
                                                />
                                            )}
                                            <Chip
                                                label={notif.priority}
                                                size="small"
                                                className={`text-[9px]! font-bold! uppercase! tracking-wider! h-5! px-1.5! border ${getPriorityColor(
                                                    notif.priority
                                                )}`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-(--text-secondary) flex items-center gap-1.5 uppercase shrink-0">
                                            <Clock size={12} />
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>

                                    <p
                                        className={`text-sm leading-relaxed ${notif.isRead
                                            ? "text-(--text-secondary) font-medium"
                                            : "text-(--text-primary) font-semibold"
                                            }`}
                                    >
                                        {notif.message}
                                    </p>

                                    {/* Hover actions */}
                                    <div className="flex items-center gap-4 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markOneRead(notif._id)}
                                                className="text-[10px] font-bold uppercase tracking-wider text-(--brand-primary) hover:underline"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        {!notif.isArchived && (
                                            <button
                                                onClick={() => archiveOne(notif._id)}
                                                className="text-[10px] font-bold uppercase tracking-wider text-(--text-secondary) hover:text-(--text-primary) flex items-center gap-1 transition-colors"
                                            >
                                                <Archive size={12} />
                                                Archive
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif._id)}
                                            className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Right action */}
                                <div className="shrink-0 flex flex-col justify-start items-end">
                                    <IconButton size="small" sx={{ color: "var(--text-secondary)" }}>
                                        <MoreVertical size={16} />
                                    </IconButton>
                                </div>
                            </div>
                        ))}

                    {/* Empty state */}
                    {!isLoading && notifications.length === 0 && (
                        <div className="text-center py-20 bg-(--bg-surface) rounded-xl border border-dashed border-(--ui-border)">
                            <div className="w-16 h-16 bg-(--bg-base) border border-(--ui-border) rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={28} className="text-(--text-secondary) opacity-50" />
                            </div>
                            <h3 className="text-(--text-primary) font-black text-lg">
                                {activeTab === 4
                                    ? "No archived notifications"
                                    : "All caught up!"}
                            </h3>
                            <p className="text-(--text-secondary) text-sm font-medium mt-1">
                                {activeTab === 4
                                    ? "Items you archive will appear in this section."
                                    : "You have no pending notifications matching this criteria."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Button
                            variant="outlined"
                            onClick={() => setPage((p) => p - 1)}
                            disabled={page === 1 || isFetching}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "uppercase",
                                fontWeight: 700,
                                fontSize: "11px",
                                letterSpacing: "0.5px",
                                borderColor: "var(--ui-border)",
                                color: "var(--text-primary)",
                                "&:hover": { borderColor: "var(--brand-primary)", bgcolor: "var(--brand-active)" },
                                "&.Mui-disabled": { borderColor: "var(--ui-border)", color: "var(--text-secondary)", opacity: 0.5 }
                            }}
                        >
                            ← Newer
                        </Button>
                        <span className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">
                            Page {page} of {pagination.pages}
                        </span>
                        <Button
                            variant="outlined"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page === pagination.pages || isFetching}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "uppercase",
                                fontWeight: 700,
                                fontSize: "11px",
                                letterSpacing: "0.5px",
                                borderColor: "var(--ui-border)",
                                color: "var(--text-primary)",
                                "&:hover": { borderColor: "var(--brand-primary)", bgcolor: "var(--brand-active)" },
                                "&.Mui-disabled": { borderColor: "var(--ui-border)", color: "var(--text-secondary)", opacity: 0.5 }
                            }}
                        >
                            Load Older →
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;