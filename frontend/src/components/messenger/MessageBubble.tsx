import React from "react";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../../services/messenger/messenger.service";

interface Props {
    message: Message;
    currentUserId: string;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const MessageBubble: React.FC<Props> = ({ message, currentUserId }) => {
    const isSent = message.sender._id === currentUserId;
    const isSeen = message.readBy.length > 1; // read by someone other than sender

    return (
        <div
            className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}
        >
            {!isSent && (
                <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {message.sender.firstName} {message.sender.lastName}
                </span>
            )}
            <div
                className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isSent
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                    }`}
            >
                {message.text}
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
