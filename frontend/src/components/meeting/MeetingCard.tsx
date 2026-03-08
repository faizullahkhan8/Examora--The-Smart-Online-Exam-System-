import React from "react";
import { IconButton } from "@mui/material";
import {
    Calendar, Clock, MapPin, Link as LinkIcon,
    Users, Pencil, Trash2, Wifi, MapPinned,
} from "lucide-react";
import type { Meeting } from "../../services/meeting/meeting.service";
import { STATUS_CFG, ACK_CFG, fmtDate } from "./meetingConstants";

interface MeetingCardProps {
    meeting: Meeting;
    currentUserId: string;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
    meeting, currentUserId, onClick, onEdit, onDelete,
}) => {
    const cfg    = STATUS_CFG[meeting.status] ?? STATUS_CFG.draft;
    const isOrg  = String(meeting.organizer?._id) === String(currentUserId);
    const myPart = meeting.participants?.find(p => String(p.user?._id) === String(currentUserId));
    const ackCfg = myPart ? ACK_CFG[myPart.acknowledgement] : null;

    return (
        <div
            onClick={onClick}
            className="bg-[var(--bg-surface)] border border-[var(--ui-border)] rounded-xl p-5 cursor-pointer hover:shadow-sm hover:border-[var(--brand-primary)] transition-colors group flex flex-col h-full"
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meeting.locationType === "online"
                        ? "bg-indigo-50 border border-indigo-100"
                        : "bg-violet-50 border border-violet-100"
                        }`}>
                        {meeting.locationType === "online"
                            ? <Wifi size={18} className="text-indigo-600" />
                            : <MapPinned size={18} className="text-violet-600" />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm text-[var(--text-primary)] truncate leading-snug">
                            {meeting.title}
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5 truncate">
                            by {meeting.organizer?.firstName} {meeting.organizer?.lastName}
                        </p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full shrink-0 ${cfg.cls}`}>
                    {cfg.label}
                </span>
            </div>

            <div className="flex flex-col gap-2 mb-4 flex-grow">
                <span className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                    <Calendar size={14} className="opacity-70" /> {fmtDate(meeting.date)}
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                    <Clock size={14} className="opacity-70" /> {meeting.startTime} – {meeting.endTime}
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] truncate">
                    {meeting.locationType === "online"
                        ? <><LinkIcon size={14} className="opacity-70" /> Online Meeting</>
                        : <><MapPin size={14} className="opacity-70" /> {meeting.location || "—"}</>
                    }
                </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--ui-divider)]">
                <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[var(--text-secondary)]" />
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                        {meeting.participants?.length ?? 0}
                    </span>
                    {ackCfg && !isOrg && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-md ml-2 ${ackCfg.cls}`}>
                            {ackCfg.icon} {ackCfg.label}
                        </span>
                    )}
                </div>
                {isOrg && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}>
                            <Pencil size={14} />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--status-danger)", bgcolor: "var(--bg-base)" } }}>
                            <Trash2 size={14} />
                        </IconButton>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingCard;
