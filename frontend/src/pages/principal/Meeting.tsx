import React, { useState, useMemo } from "react";
import {
    Button, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Skeleton, CircularProgress,
} from "@mui/material";
import {
    Plus, Search, Calendar, Clock3, ClipboardList, UserCheck,
} from "lucide-react";
import {
    useGetMeetingsQuery,
    useDeleteMeetingMutation,
    type Meeting,
} from "../../services/meeting/meeting.service";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { btnSx } from "../../components/meeting/meetingConstants";
import MeetingCard from "../../components/meeting/MeetingCard";
import CreateDrawer from "../../components/meeting/CreateDrawer";
import DetailDrawer from "../../components/meeting/DetailDrawer";

// ─── Main Meetings Page ────────────────────────────────────────────────────────
const Meetings: React.FC = () => {
    const auth = useSelector((s: RootState) => s.auth);
    const currentUserId = (auth as any)?.id ?? "";
    const userRole = (auth as any)?.role ?? "";

    const canCreate = ["admin", "principal", "hod", "teacher"].includes(userRole);

    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);

    const [deleteMeeting, { isLoading: isDeleting }] = useDeleteMeetingMutation();

    const TAB_ARGS = [
        { tab: "participant", status: "scheduled" },
        { tab: "participant", status: "completed" },
        { tab: "organizer", status: "draft" },
        { tab: "organizer", status: "all" },
    ];

    const { data, isLoading } = useGetMeetingsQuery(TAB_ARGS[tab]);

    const meetings = useMemo(() => {
        const all = data?.data ?? [];
        if (!search.trim()) return all;
        const q = search.toLowerCase();
        return all.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q) ||
            `${m.organizer?.firstName} ${m.organizer?.lastName}`.toLowerCase().includes(q),
        );
    }, [data, search]);

    const upcoming = (data?.data ?? []).filter(m => m.status === "scheduled").length;
    const pendingAck = (data?.data ?? []).filter(m =>
        m.participants?.some(p => String(p.user?._id) === currentUserId && p.acknowledgement === "pending"),
    ).length;

    return (
        <div className="w-full bg-[var(--bg-base)] min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">

                {/* Page header */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Meetings</h1>
                        <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">
                            Schedule, manage, and track institutional meetings and sessions.
                        </p>
                    </div>
                    {canCreate && (
                        <div className="flex items-center gap-3">
                            <Button variant="contained" startIcon={<Plus size={16} />}
                                onClick={() => { setEditMeeting(null); setDrawerOpen(true); }}
                                sx={{ ...btnSx, bgcolor: "var(--brand-primary)", px: 3, "&:hover": { bgcolor: "var(--bg-sidebar)" } }}>
                                Create Meeting
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Upcoming", value: upcoming, icon: <Calendar size={20} />, cls: "text-blue-600 bg-blue-50" },
                        { label: "Pending RSVP", value: pendingAck, icon: <Clock3 size={20} />, cls: "text-amber-600 bg-amber-50" },
                        { label: "Total Meetings", value: data?.data?.length ?? 0, icon: <ClipboardList size={20} />, cls: "text-violet-600 bg-violet-50" },
                        { label: "My Role", value: userRole, icon: <UserCheck size={20} />, cls: "text-emerald-600 bg-emerald-50" },
                    ].map(({ label, value, icon, cls }) => (
                        <div key={label} className="p-5 bg-[var(--bg-surface)] border border-[var(--ui-border)] rounded-xl hover:border-[var(--brand-primary)] transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2.5 rounded-lg bg-[var(--bg-base)] w-fit ${cls}`}>
                                    {icon}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight capitalize">{value}</h3>
                            <p className="text-xs font-semibold text-[var(--text-secondary)] mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs + Search */}
                <div className="mb-6 bg-[var(--bg-surface)] border border-[var(--ui-border)] rounded-xl p-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        minHeight: "40px",
                        "& .MuiTabs-indicator": { backgroundColor: "var(--brand-primary)", height: 3, borderRadius: "3px" },
                        "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "13px", color: "var(--text-secondary)", minHeight: "40px", px: 3, "&.Mui-selected": { color: "var(--text-primary)" } },
                    }}>
                        <Tab label="Upcoming" />
                        <Tab label="Past" />
                        <Tab label="Drafts" />
                        {canCreate && <Tab label="My Created" />}
                    </Tabs>
                    <div className="relative px-2 md:px-0">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                        <input placeholder="Search meetings…" value={search} onChange={e => setSearch(e.target.value)}
                            className="bg-[var(--bg-base)] border border-[var(--ui-border)] rounded-lg pl-9 pr-4 py-2 text-sm font-medium text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none w-64 transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Skeleton key={i} height={180} sx={{ bgcolor: "var(--ui-divider)", borderRadius: "12px", transform: "none" }} />
                        ))}
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="text-center py-24 bg-[var(--bg-surface)] rounded-xl border border-[var(--ui-border)] border-dashed">
                        <ClipboardList size={52} className="mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
                        <p className="font-black text-[var(--text-primary)] text-lg">No meetings found</p>
                        <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                            {canCreate ? 'Click "Create Meeting" to get started.' : "You haven't been added to any meetings yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {meetings.map(m => (
                            <MeetingCard
                                key={m._id}
                                meeting={m}
                                currentUserId={currentUserId}
                                onClick={() => setDetailId(m._id)}
                                onEdit={() => { setEditMeeting(m); setDrawerOpen(true); }}
                                onDelete={() => setDeleteTarget(m)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Drawer */}
            <CreateDrawer
                open={drawerOpen}
                editing={editMeeting}
                onClose={() => { setDrawerOpen(false); setEditMeeting(null); }}
            />

            {/* Detail Drawer */}
            <DetailDrawer
                meetingId={detailId}
                currentUserId={currentUserId}
                onClose={() => setDetailId(null)}
            />

            {/* Delete dialog */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
                PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)", bgcolor: "var(--bg-surface)", minWidth: 400, boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}>
                <DialogTitle sx={{ fontWeight: 800, color: "var(--text-primary)", px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>
                    Cancel Meeting
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 1 }}>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                        Are you sure you want to permanently cancel{" "}
                        <strong className="text-[var(--text-primary)]">{deleteTarget?.title}</strong>?
                        All participants will be notified of this cancellation.
                    </p>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
                    <Button onClick={() => setDeleteTarget(null)}
                        sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>
                        Abort
                    </Button>
                    <Button variant="contained" color="error" disabled={isDeleting}
                        onClick={async () => {
                            if (!deleteTarget) return;
                            await deleteMeeting(deleteTarget._id);
                            setDeleteTarget(null);
                        }}
                        sx={{ ...btnSx }}>
                        {isDeleting ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Cancel Meeting"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Meetings;