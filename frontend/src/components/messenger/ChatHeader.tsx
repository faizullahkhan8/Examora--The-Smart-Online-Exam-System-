import React from "react";
import { Avatar, IconButton } from "@mui/material";
import { Search, Info, MoreVertical, Users } from "lucide-react";
import type { Conversation } from "../../services/messenger/messenger.service";

interface Props {
    conversation: Conversation;
    currentUserId: string;
    showDetails: boolean;
    onToggleDetails: () => void;
}

const ChatHeader: React.FC<Props> = ({
    conversation,
    currentUserId,
    showDetails,
    onToggleDetails,
}) => {
    let name = "";
    let subtitle = "";
    let initials = "";
    let isOnline = false;
    let isGroup = false;

    if (conversation.type === "direct") {
        const other = conversation.participants.find((p) => p._id !== currentUserId);
        name = other ? `${other.firstName} ${other.lastName}` : "Unknown User";
        subtitle = [
            other?.role,
            typeof other?.institute === "object" && other?.institute ? other.institute.name : "",
        ]
            .filter(Boolean)
            .join(" • ");
        initials = other ? `${other.firstName[0]}${other.lastName[0]}` : "??";
        isOnline = other?.isActive ?? false;
    } else if (conversation.type === "group") {
        name = conversation.name ?? "Group Chat";
        subtitle = `${conversation.participants.length} members`;
        isGroup = true;
    } else {
        name = conversation.name ?? "Announcement";
        subtitle = "System Broadcast Channel";
        isOnline = true;
    }

    return (
        <div className="h-[72px] border-b border-(--ui-divider) px-6 flex items-center justify-between shrink-0 bg-(--bg-surface) shadow-sm z-10">
            <div className="flex items-center gap-4">
                {conversation.type === "announcement" ? (
                    <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-xl shadow-sm border border-rose-100">
                        📢
                    </div>
                ) : isGroup ? (
                    <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shadow-sm border border-violet-100">
                        <Users size={20} className="text-violet-600" />
                    </div>
                ) : (
                    <Avatar sx={{ width: 44, height: 44 }} className="!bg-(--bg-sidebar) !text-(--text-on-dark) !font-bold !text-sm !rounded-xl !shadow-sm">
                        {initials}
                    </Avatar>
                )}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-bold text-(--text-primary) tracking-tight leading-tight">
                            {name}
                        </h2>
                        {isOnline && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        )}
                    </div>
                    <p className="text-[11px] font-semibold text-(--text-secondary) capitalize mt-0.5">
                        {subtitle}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <IconButton size="small" sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                    <Search size={18} />
                </IconButton>
                <IconButton size="small" onClick={onToggleDetails} sx={{ color: showDetails ? "var(--brand-primary)" : "var(--text-secondary)", bgcolor: showDetails ? "var(--brand-active)" : "transparent", "&:hover": { color: "var(--brand-primary)", bgcolor: "var(--bg-base)" } }}>
                    <Info size={18} />
                </IconButton>
                <IconButton size="small" sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                    <MoreVertical size={18} />
                </IconButton>
            </div>
        </div>
    );
};

export default ChatHeader;