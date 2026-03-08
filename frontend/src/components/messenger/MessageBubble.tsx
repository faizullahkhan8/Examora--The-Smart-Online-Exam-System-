import React from "react";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../../services/messenger/messenger.service";

interface Props {
    message: Message;
    currentUserId: string;
    searchQuery?: string;
    isFocused?: boolean;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Splits text into parts and wraps matching segments in a highlight span. */
function HighlightedText({
    text,
    query,
    isSent,
}: {
    text: string;
    query: string;
    isSent: boolean;
}) {
    if (!query.trim()) return <>{text}</>;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));

    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark
                        key={i}
                        className={`rounded px-0.5 font-bold ${isSent
                            ? "bg-yellow-300 text-slate-900"
                            : "bg-yellow-300 text-slate-900"
                            }`}
                        style={{ backgroundColor: "#fde047" }}
                    >
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                ),
            )}
        </>
    );
}

const MessageBubble: React.FC<Props> = ({
    message,
    currentUserId,
    searchQuery = "",
    isFocused = false,
}) => {
    const isSent = message.sender._id === currentUserId;
    const isSeen = message.readBy.length > 1;

    return (
        <div
            className={`flex flex-col transition-all duration-300 ${isSent ? "items-end" : "items-start"} ${isFocused ? "scale-[1.01]" : ""}`}
        >
            {!isSent && (
                <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {message.sender.firstName} {message.sender.lastName}
                </span>
            )}
            <div
                className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed transition-all duration-300 ${isSent
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    } ${isFocused
                        ? "ring-2 ring-yellow-400 ring-offset-1 shadow-md"
                        : ""
                    }`}
            >
                <HighlightedText
                    text={message.text}
                    query={searchQuery}
                    isSent={isSent}
                />
            </div>
            <div className="flex items-center gap-1.5 mt-1 px-1">
                <span className="text-[10px] font-bold text-slate-400">
                    {formatTime(message.createdAt)}
                </span>
                {isSent &&
                    (isSeen ? (
                        <CheckCheck size={12} className="text-blue-500" />
                    ) : (
                        <Check size={12} className="text-slate-300" />
                    ))}
            </div>
        </div>
    );
};

export default MessageBubble;
