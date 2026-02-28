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
    const isGroup =
        conversation.type === "group" ||
        conversation.type === "announcement";

    let displayName = "";
    let displayRole = "";
    let displayInstitute = "";
    let initials = "";

    if (conversation.type === "direct") {
        const other = conversation.participants.find(
            (p) => p._id !== currentUserId,
        );
        displayName = other
            ? `${other.firstName} ${other.lastName}`
            : "Unknown User";
        displayRole = other?.role ?? "";
        displayInstitute =
            typeof other?.institute === "object" && other?.institute
                ? other.institute.name
                : "";
        initials = other
            ? `${other.firstName[0]}${other.lastName[0]}`
            : "??";
    } else {
        displayName = conversation.name ?? "Group";
        displayRole = conversation.type === "group" ? "Group" : "Broadcast";
        displayInstitute = `${conversation.participants.length} members`;
    }

    return (
        <div className="w-[300px] bg-white border-l border-slate-200 flex flex-col shrink-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    Details
                </h3>
                <IconButton size="small" onClick={onClose}>
                    <X size={18} />
                </IconButton>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-center flex-grow">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                    {conversation.type === "announcement" ? (
                        <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center text-5xl mb-4 shadow-xl">
                            📢
                        </div>
                    ) : isGroup ? (
                        <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center mb-4 shadow-xl">
                            <Users size={40} className="text-violet-600" />
                        </div>
                    ) : (
                        <Avatar
                            className="bg-slate-900 text-white font-black text-xl mb-4 shadow-xl"
                            sx={{ width: 96, height: 96 }}
                        >
                            {initials}
                        </Avatar>
                    )}
                    <h2 className="text-lg font-black text-slate-900">
                        {displayName}
                    </h2>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 capitalize">
                        {displayRole}
                    </p>
                    {displayInstitute && (
                        <div className="mt-3 flex gap-2 justify-center flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                <Building2 size={10} />
                                {displayInstitute}
                            </span>
                        </div>
                    )}
                </div>

                {/* Group Members */}
                {isGroup && (
                    <div className="text-left space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Members ({conversation.participants.length})
                        </h4>
                        {conversation.participants.slice(0, 6).map((p) => (
                            <div
                                key={p._id}
                                className="flex items-center gap-2"
                            >
                                <Avatar
                                    sx={{ width: 28, height: 28 }}
                                    className="bg-slate-700 text-white text-[10px] font-black"
                                >
                                    {p.firstName[0]}
                                    {p.lastName[0]}
                                </Avatar>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">
                                        {p.firstName} {p.lastName}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-medium capitalize">
                                        {p.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {conversation.participants.length > 6 && (
                            <p className="text-[10px] text-slate-400 font-bold">
                                +{conversation.participants.length - 6} more
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <VolumeX size={18} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">
                                Mute Notifications
                            </span>
                        </div>
                        <Switch size="small" />
                    </div>

                    {conversation.type === "group" && (
                        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <LogOut size={18} />
                                <span className="text-xs font-bold">
                                    Leave Group
                                </span>
                            </div>
                        </div>
                    )}

                    <div
                        onClick={onDelete}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center gap-3 text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                        <Trash2 size={18} />
                        <span className="text-xs font-bold">
                            Delete Conversation
                        </span>
                    </div>
                </div>

                {/* Shared Files placeholder */}
                <div className="text-left space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Shared Files
                        </h4>
                        <span className="text-[10px] font-bold text-slate-900 cursor-pointer">
                            View All
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center"
                            >
                                <ImageIcon
                                    size={20}
                                    className="text-slate-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDetails;
