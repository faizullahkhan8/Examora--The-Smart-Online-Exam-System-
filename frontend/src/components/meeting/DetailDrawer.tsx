import React, { useState } from "react";
import {
    Button, IconButton, Drawer,
    TextField, Skeleton, Avatar, CircularProgress,
} from "@mui/material";
import {
    Calendar, Clock, MapPin, Link as LinkIcon,
    Users, CheckCircle, XCircle, X, AlertCircle, Wifi,
} from "lucide-react";
import {
    useGetMeetingByIdQuery,
    useAcknowledgeMeetingMutation,
    useMarkAttendanceMutation,
    useUpdateMeetingStatusMutation,
    type MeetingParticipant,
} from "../../services/meeting/meeting.service";
import { tfSx, btnSx, STATUS_CFG, ACK_CFG, fmtDate } from "./meetingConstants";

interface DetailDrawerProps {
    meetingId: string | null;
    currentUserId: string;
    onClose: () => void;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({ meetingId, currentUserId, onClose }) => {
    const [ackReason, setAckReason] = useState("");
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, "present" | "absent" | "excused">>({});

    const { data, isLoading } = useGetMeetingByIdQuery(meetingId!, { skip: !meetingId });
    const [acknowledge, { isLoading: isAcking }] = useAcknowledgeMeetingMutation();
    const [markAttendance, { isLoading: isMarking }] = useMarkAttendanceMutation();
    const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateMeetingStatusMutation();

    const meeting = data?.data;
    const isOrg   = String(meeting?.organizer?._id) === String(currentUserId);
    const myPart  = meeting?.participants?.find(p => String(p.user?._id) === String(currentUserId));
    const needsAck = !isOrg && myPart && myPart.acknowledgement === "pending";

    const handleAck = async (ack: "attending" | "not_attending") => {
        if (!meetingId) return;
        try {
            await acknowledge({ id: meetingId, acknowledgement: ack, acknowledgementReason: ackReason }).unwrap();
            setShowReasonInput(false);
            setAckReason("");
        } catch { /* handled globally */ }
    };

    const handleMarkAttendance = async () => {
        if (!meetingId) return;
        const entries = Object.entries(attendanceMap).map(([userId, status]) => ({ userId, status }));
        if (entries.length === 0) return;
        try {
            await markAttendance({ id: meetingId, attendance: entries }).unwrap();
            setAttendanceMap({});
        } catch { /* handled globally */ }
    };

    const cfg = meeting ? STATUS_CFG[meeting.status] : null;

    return (
        <Drawer anchor="right" open={!!meetingId} onClose={onClose}
            PaperProps={{ sx: { width: 520, bgcolor: "var(--bg-surface)", borderLeft: "1px solid var(--ui-border)" } }}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="h-[72px] px-6 border-b border-[var(--ui-divider)] flex items-center justify-between bg-[var(--bg-base)] shrink-0">
                    <h3 className="text-base font-black text-[var(--text-primary)]">Meeting Details</h3>
                    <IconButton onClick={onClose} size="small"
                        sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--ui-divider)" } }}>
                        <X size={18} />
                    </IconButton>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} height={60} sx={{ bgcolor: "var(--ui-divider)", borderRadius: "12px" }} variant="rectangular" />)}
                    </div>
                )}

                {/* Content */}
                {meeting && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        {/* Title + Status */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {cfg && (
                                    <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-md ${cfg.cls}`}>
                                        {cfg.label}
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] leading-tight">{meeting.title}</h2>
                            {meeting.description && (
                                <p className="text-sm text-[var(--text-secondary)] font-medium mt-2 leading-relaxed">{meeting.description}</p>
                            )}
                        </div>

                        {/* Acknowledgement banner */}
                        {needsAck && (
                            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50 space-y-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={18} className="text-indigo-600 shrink-0" />
                                    <p className="text-sm font-bold text-indigo-900">
                                        You've been invited to this meeting. Will you attend?
                                    </p>
                                </div>

                                {showReasonInput && (
                                    <TextField fullWidth size="small" label="Reason (optional)"
                                        value={ackReason} onChange={e => setAckReason(e.target.value)}
                                        sx={tfSx} placeholder="e.g. I have a class conflict" />
                                )}

                                <div className="flex gap-3">
                                    <Button variant="contained" startIcon={<CheckCircle size={16} />}
                                        disabled={isAcking}
                                        onClick={() => handleAck("attending")}
                                        sx={{ ...btnSx, bgcolor: "#10b981", flex: 1, "&:hover": { bgcolor: "#059669" } }}>
                                        I'll Attend
                                    </Button>
                                    <Button variant="outlined" startIcon={<XCircle size={16} />}
                                        disabled={isAcking}
                                        onClick={() => setShowReasonInput(r => !r)}
                                        sx={{ ...btnSx, borderColor: "#f43f5e", color: "#f43f5e", flex: 1, "&:hover": { bgcolor: "#fff1f2", borderColor: "#f43f5e" } }}>
                                        {showReasonInput ? "Cancel" : "Can't Attend"}
                                    </Button>
                                </div>

                                {showReasonInput && (
                                    <Button fullWidth variant="contained" onClick={() => handleAck("not_attending")}
                                        disabled={isAcking}
                                        sx={{ ...btnSx, bgcolor: "#f43f5e", "&:hover": { bgcolor: "#e11d48" } }}>
                                        Confirm — I Can't Attend
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* My response (after ack) */}
                        {myPart && myPart.acknowledgement !== "pending" && !isOrg && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl border ${ACK_CFG[myPart.acknowledgement].cls}`}>
                                {ACK_CFG[myPart.acknowledgement].icon}
                                <span className="text-sm font-bold">Your response: {ACK_CFG[myPart.acknowledgement].label}</span>
                                {myPart.acknowledgementReason && (
                                    <span className="text-xs font-medium opacity-80">— {myPart.acknowledgementReason}</span>
                                )}
                            </div>
                        )}

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: <Calendar size={16} />, label: "Date",         value: fmtDate(meeting.date) },
                                { icon: <Clock size={16} />,    label: "Time",         value: `${meeting.startTime} – ${meeting.endTime}` },
                                {
                                    icon: meeting.locationType === "online" ? <Wifi size={16} /> : <MapPin size={16} />,
                                    label: "Location",
                                    value: meeting.locationType === "online"
                                        ? (meeting.meetingLink ? "Online" : "Online (no link set)")
                                        : (meeting.location || "Physical"),
                                },
                                { icon: <Users size={16} />,    label: "Participants", value: `${meeting.participants?.length ?? 0} invited` },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--ui-border)] flex items-start gap-3 shadow-sm">
                                    <span className="text-[var(--brand-primary)] p-2 rounded-lg bg-[var(--brand-active)]">{icon}</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 truncate">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Open link button */}
                        {meeting.locationType === "online" && meeting.meetingLink && (
                            <a href={meeting.meetingLink} target="_blank" rel="noreferrer">
                                <Button fullWidth startIcon={<LinkIcon size={16} />}
                                    sx={{ ...btnSx, py: 1.25, borderColor: "var(--brand-primary)", color: "var(--brand-primary)", border: "1px solid", "&:hover": { bgcolor: "var(--brand-active)" } }}>
                                    Open Meeting Link
                                </Button>
                            </a>
                        )}

                        {/* Organizer */}
                        <div className="flex items-center gap-4 p-4 bg-[var(--bg-base)] border border-[var(--ui-border)] rounded-xl shadow-sm">
                            <Avatar sx={{ width: 44, height: 44, fontSize: "14px", fontWeight: 700 }}
                                className="bg-[var(--bg-sidebar)]! text-[var(--text-on-dark)]!">
                                {meeting.organizer?.firstName?.[0]}{meeting.organizer?.lastName?.[0]}
                            </Avatar>
                            <div>
                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Organizer</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">
                                    {meeting.organizer?.firstName} {meeting.organizer?.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Participants roster */}
                        <div>
                            <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-4 border-b border-[var(--ui-divider)] pb-2">
                                Participants Roster ({meeting.participants?.length})
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                {meeting.participants?.map((p: MeetingParticipant) => {
                                    const ack = ACK_CFG[p.acknowledgement];
                                    return (
                                        <div key={p.user?._id}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--ui-border)] bg-[var(--bg-base)] hover:border-[var(--brand-primary)] transition-colors">
                                            <Avatar sx={{ width: 32, height: 32, fontSize: "12px", fontWeight: 700 }}
                                                className="bg-[var(--bg-sidebar)]! text-[var(--text-on-dark)]!">
                                                {p.user?.firstName?.[0]}{p.user?.lastName?.[0]}
                                            </Avatar>
                                            <div className="min-w-0 grow">
                                                <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                                                    {p.user?.firstName} {p.user?.lastName}
                                                </p>
                                                <p className="text-[10px] text-[var(--text-secondary)] font-medium capitalize truncate">{p.user?.role}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className={`flex items-center gap-1 text-[9px] font-bold border px-2 py-0.5 rounded-md ${ack.cls}`}>
                                                    {ack.icon} {ack.label}
                                                </span>
                                            </div>

                                            {isOrg && (
                                                <select
                                                    value={attendanceMap[p.user?._id] ?? p.attendanceStatus ?? ""}
                                                    onChange={e => setAttendanceMap(m => ({ ...m, [p.user._id]: e.target.value as any }))}
                                                    onClick={e => e.stopPropagation()}
                                                    className="text-xs font-bold border border-[var(--ui-border)] rounded-lg px-2 py-1.5 bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-primary)] shrink-0 ml-2"
                                                >
                                                    <option value="">Mark</option>
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                    <option value="excused">Excused</option>
                                                </select>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {isOrg && Object.keys(attendanceMap).length > 0 && (
                                <Button fullWidth variant="contained" disabled={isMarking}
                                    onClick={handleMarkAttendance}
                                    sx={{ ...btnSx, mt: 3, py: 1.25, bgcolor: "var(--brand-primary)", "&:hover": { bgcolor: "var(--bg-sidebar)" } }}>
                                    {isMarking
                                        ? <CircularProgress size={16} sx={{ color: "white" }} />
                                        : `Save Attendance (${Object.keys(attendanceMap).length})`
                                    }
                                </Button>
                            )}
                        </div>

                        {/* Meeting notes (organizer) */}
                        {isOrg && (
                            <div>
                                <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                                    Meeting Notes / Minutes
                                </h4>
                                <TextField fullWidth multiline rows={4} placeholder="Add official meeting notes..."
                                    defaultValue={meeting.notes} sx={tfSx} />
                            </div>
                        )}

                        {/* Status controls (organizer) */}
                        {isOrg && (
                            <div className="space-y-3 pt-4 border-t border-[var(--ui-divider)]">
                                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Lifecycle Status</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["scheduled", "completed", "cancelled", "draft"] as const)
                                        .filter(s => s !== meeting.status)
                                        .map(s => {
                                            const c = STATUS_CFG[s];
                                            return (
                                                <button key={s}
                                                    onClick={() => updateStatus({ id: meeting._id, status: s })}
                                                    disabled={isUpdatingStatus}
                                                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${c.cls} hover:opacity-80`}>
                                                    {isUpdatingStatus ? "..." : `Mark ${c.label}`}
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default DetailDrawer;
