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
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        let label = "";

        if (diffDays === 0) label = "Today";
        else if (diffDays === 1) label = "Yesterday";
        else label = date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });

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
            <div className="grow flex items-center justify-center bg-(--bg-base)">
                <CircularProgress size={28} sx={{ color: "var(--brand-primary)" }} />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="grow flex flex-col items-center justify-center gap-3 bg-(--bg-base) text-(--text-secondary) opacity-70">
                <span className="text-4xl">💬</span>
                <p className="text-sm font-semibold">
                    No messages yet. Start the conversation!
                </p>
            </div>
        );
    }

    const groups = groupByDate(messages);

    return (
        <div className="grow overflow-y-auto p-6 space-y-8 bg-(--bg-base) custom-scrollbar">
            {groups.map((group) => (
                <div key={group.label} className="space-y-4">
                    <div className="flex justify-center sticky top-2 z-10">
                        <span className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-widest bg-(--bg-surface) px-4 py-1.5 rounded-full border border-(--ui-border) shadow-sm">
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