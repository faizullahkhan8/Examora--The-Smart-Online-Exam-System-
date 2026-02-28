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
        const other = conversation.participants.find(
            (p) => p._id !== currentUserId,
        );
        name = other ? `${other.firstName} ${other.lastName}` : "Unknown User";
        subtitle = [
            other?.role,
            typeof other?.institute === "object" && other?.institute
                ? other.institute.name
                : "",
        ]
            .filter(Boolean)
            .join(" • ");
        initials = other
            ? `${other.firstName[0]}${other.lastName[0]}`
            : "??";
        isOnline = other?.isActive ?? false;
    } else if (conversation.type === "group") {
        name = conversation.name ?? "Group Chat";
        subtitle = `${conversation.participants.length} members`;
        isGroup = true;
    } else {
        name = conversation.name ?? "Announcement";
        subtitle = "Broadcast to all members";
        isOnline = true;
    }

    return (
        <div className="h-20 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
                {conversation.type === "announcement" ? (
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-xl">
                        📢
                    </div>
                ) : isGroup ? (
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Users size={20} className="text-violet-600" />
                    </div>
                ) : (
                    <Avatar className="bg-slate-900 text-white font-black text-sm">
                        {initials}
                    </Avatar>
                )}
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900">
                            {name}
                        </h2>
                        {isOnline && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {subtitle}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                <IconButton size="small">
                    <Search size={20} className="text-slate-400" />
                </IconButton>
                <IconButton size="small" onClick={onToggleDetails}>
                    <Info
                        size={20}
                        className={
                            showDetails ? "text-slate-900" : "text-slate-400"
                        }
                    />
                </IconButton>
                <IconButton size="small">
                    <MoreVertical size={20} className="text-slate-400" />
                </IconButton>
            </div>
        </div>
    );
};

export default ChatHeader;
