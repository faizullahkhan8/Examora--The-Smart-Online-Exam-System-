import React, { useEffect, useRef } from "react";
import { CircularProgress } from "@mui/material";
import MessageBubble from "./MessageBubble";
import type { Message } from "../../services/messenger/messenger.service";

interface Props {
    messages: Message[];
    isLoading: boolean;
    currentUserId: string;
}

function groupByDate(messages: Message[]) {
    const groups: { label: string; messages: Message[] }[] = [];
    let lastLabel = "";

    for (const msg of messages) {
        const date = new Date(msg.createdAt);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );
        let label = "";
        if (diffDays === 0) label = "Today";
        else if (diffDays === 1) label = "Yesterday";
        else
            label = date.toLocaleDateString([], {
                weekday: "long",
                month: "short",
                day: "numeric",
            });

        if (label !== lastLabel) {
            groups.push({ label, messages: [msg] });
            lastLabel = label;
        } else {
            groups[groups.length - 1].messages.push(msg);
        }
    }
    return groups;
}

const MessageList: React.FC<Props> = ({ messages, isLoading, currentUserId }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex-grow flex items-center justify-center bg-[#F8FAFC]/50">
                <CircularProgress size={28} sx={{ color: "#1e293b" }} />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center gap-3 bg-[#F8FAFC]/50 text-slate-300">
                <span className="text-5xl">💬</span>
                <p className="text-sm font-bold text-slate-400">
                    No messages yet. Say hello!
                </p>
            </div>
        );
    }

    const groups = groupByDate(messages);

    return (
        <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[#F8FAFC]/50">
            {groups.map((group) => (
                <div key={group.label} className="space-y-4">
                    <div className="flex justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-1 rounded-full border border-slate-100">
                            {group.label}
                        </span>
                    </div>
                    {group.messages.map((msg) => (
                        <MessageBubble
                            key={msg._id}
                            message={msg}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            ))}
            <div ref={endRef} />
        </div>
    );
};

export default MessageList;
