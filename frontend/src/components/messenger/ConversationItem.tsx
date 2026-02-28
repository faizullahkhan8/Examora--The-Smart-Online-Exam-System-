import React from "react";
import { Avatar } from "@mui/material";
import { Megaphone, Users } from "lucide-react";
import type { Conversation } from "../../services/messenger/messenger.service";

interface Props {
    conversation: Conversation;
    isSelected: boolean;
    currentUserId: string;
    onClick: () => void;
}

function getConversationDisplay(
    conversation: Conversation,
    currentUserId: string,
) {
    if (conversation.type === "direct") {
        const other = conversation.participants.find(
            (p) => p._id !== currentUserId,
        );
        return {
            name: other
                ? `${other.firstName} ${other.lastName}`
                : "Unknown User",
            role: other?.role ?? "",
            institute:
                typeof other?.institute === "object" && other?.institute
                    ? other.institute.name
                    : "",
            initials: other
                ? `${other.firstName[0]}${other.lastName[0]}`
                : "??",
            online: other?.isActive ?? false,
        };
    }
    if (conversation.type === "group") {
        return {
            name: conversation.name ?? "Group Chat",
            role: "Group",
            institute: `${conversation.participants.length} members`,
            initials: (conversation.name ?? "GC").slice(0, 2).toUpperCase(),
            online: false,
        };
    }
    // announcement
    return {
        name: conversation.name ?? "Announcement",
        role: "Broadcast",
        institute: "All members",
        initials: "📢",
        online: true,
    };
}

function formatTime(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7)
        return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

const ConversationItem: React.FC<Props> = ({
    conversation,
    isSelected,
    currentUserId,
    onClick,
}) => {
    const display = getConversationDisplay(conversation, currentUserId);
    const lastMsg = conversation.lastMessage;
    const lastText = lastMsg?.text ?? "No messages yet";
    const lastTime = formatTime(
        lastMsg?.createdAt ?? conversation.updatedAt,
    );

    return (
        <div
            onClick={onClick}
            className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-50 relative ${isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
                }`}
        >
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
            )}

            {/* Avatar */}
            <div className="relative shrink-0">
                {conversation.type === "announcement" ? (
                    <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center text-xl">
                        📢
                    </div>
                ) : conversation.type === "group" ? (
                    <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center">
                        <Users size={20} className="text-violet-600" />
                    </div>
                ) : (
                    <Avatar
                        className="bg-slate-900 text-white font-black text-xs"
                        sx={{ width: 44, height: 44 }}
                    >
                        {display.initials}
                    </Avatar>
                )}
                {display.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-sm font-black text-slate-900 truncate">
                        {display.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
                        {lastTime}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">
                        {display.role}
                    </span>
                    {display.institute && (
                        <span className="text-[9px] font-bold text-slate-400 truncate tracking-tight">
                            {display.institute}
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">
                    {conversation.type === "announcement" && (
                        <Megaphone
                            size={12}
                            className="inline mr-1 text-rose-500"
                        />
                    )}
                    {lastMsg?.sender
                        ? `${lastMsg.sender.firstName}: ${lastText}`
                        : lastText}
                </p>
            </div>
        </div>
    );
};

export default ConversationItem;
