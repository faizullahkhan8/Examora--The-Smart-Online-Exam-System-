import React from "react";
import { Avatar, Switch, IconButton } from "@mui/material";
import { Building2, VolumeX, Trash2, LogOut, X, Users, Image as ImageIcon } from "lucide-react";
import type { Conversation } from "../../services/messenger/messenger.service";

interface Props {
    conversation: Conversation;
    currentUserId: string;
    onClose: () => void;
    onDelete: () => void;
}

const ChatDetails: React.FC<Props> = ({
    conversation,
    currentUserId,
    onClose,
    onDelete,
}) => {
    const isGroup = conversation.type === "group" || conversation.type === "announcement";

    let displayName = "";
    let displayRole = "";
    let displayInstitute = "";
    let initials = "";

    if (conversation.type === "direct") {
        const other = conversation.participants.find((p) => p._id !== currentUserId);
        displayName = other ? `${other.firstName} ${other.lastName}` : "Unknown User";
        displayRole = other?.role ?? "";
        displayInstitute = typeof other?.institute === "object" && other?.institute ? other.institute.name : "";
        initials = other ? `${other.firstName[0]}${other.lastName[0]}` : "??";
    } else {
        displayName = conversation.name ?? "Group Chat";
        displayRole = conversation.type === "group" ? "Group" : "Broadcast";
        displayInstitute = `${conversation.participants.length} total members`;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-[72px] px-5 border-b border-(--ui-divider) flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-(--text-primary)">
                    Conversation Info
                </h3>
                <IconButton size="small" onClick={onClose} sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                    <X size={18} />
                </IconButton>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-center grow">
                {/* Avatar Profile */}
                <div className="flex flex-col items-center">
                    {conversation.type === "announcement" ? (
                        <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center text-4xl mb-4 border border-rose-100 shadow-sm">
                            📢
                        </div>
                    ) : isGroup ? (
                        <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mb-4 border border-violet-100 shadow-sm">
                            <Users size={32} className="text-violet-600" />
                        </div>
                    ) : (
                        <Avatar
                            sx={{ width: 80, height: 80, mb: 2, fontSize: "1.75rem", fontWeight: 800 }}
                            className="!bg-(--bg-sidebar) !text-(--text-on-dark) !rounded-2xl !shadow-sm"
                        >
                            {initials}
                        </Avatar>
                    )}
                    <h2 className="text-lg font-bold text-(--text-primary) leading-tight">
                        {displayName}
                    </h2>
                    <p className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider mt-1 capitalize">
                        {displayRole}
                    </p>
                    {displayInstitute && (
                        <div className="mt-3 flex gap-2 justify-center">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-(--bg-base) border border-(--ui-border) text-(--text-secondary) px-2.5 py-1 rounded-md">
                                <Building2 size={12} />
                                {displayInstitute}
                            </span>
                        </div>
                    )}
                </div>

                {/* Group Members List */}
                {isGroup && (
                    <div className="text-left space-y-3 pt-2">
                        <h4 className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mb-2">
                            Participants ({conversation.participants.length})
                        </h4>
                        <div className="space-y-1">
                            {conversation.participants.slice(0, 6).map((p) => (
                                <div key={p._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--bg-base) transition-colors">
                                    <Avatar sx={{ width: 32, height: 32, fontSize: "11px", fontWeight: 700 }} className="!bg-(--bg-sidebar) !text-(--text-on-dark)">
                                        {p.firstName[0]}{p.lastName[0]}
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-(--text-primary) truncate">
                                            {p.firstName} {p.lastName}
                                        </p>
                                        <p className="text-[10px] text-(--text-secondary) font-medium capitalize truncate">
                                            {p.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {conversation.participants.length > 6 && (
                            <p className="text-[10px] text-(--brand-primary) font-bold text-center cursor-pointer hover:underline">
                                View {conversation.participants.length - 6} more participants
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-(--ui-divider)">
                    <div className="p-3.5 rounded-xl border border-(--ui-border) bg-(--bg-base) flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <VolumeX size={16} className="text-(--text-secondary)" />
                            <span className="text-xs font-bold text-(--text-primary)">
                                Mute Notifications
                            </span>
                        </div>
                        <Switch size="small" sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--brand-primary)" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--brand-primary)" } }} />
                    </div>

                    {conversation.type === "group" && (
                        <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <LogOut size={16} />
                                <span className="text-xs font-bold">Leave Group Chat</span>
                            </div>
                        </div>
                    )}

                    <div onClick={onDelete} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center gap-3 text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors">
                        <Trash2 size={16} />
                        <span className="text-xs font-bold">Delete Conversation</span>
                    </div>
                </div>

                {/* Shared Files Placeholder */}
                <div className="text-left space-y-3 pt-2 border-t border-(--ui-divider)">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                            Shared Media
                        </h4>
                        <span className="text-[10px] font-bold text-(--brand-primary) cursor-pointer hover:underline">
                            See All
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square bg-(--bg-base) rounded-lg border border-(--ui-border) flex items-center justify-center transition-colors hover:border-(--brand-primary) cursor-pointer">
                                <ImageIcon size={18} className="text-(--text-secondary) opacity-50" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDetails;