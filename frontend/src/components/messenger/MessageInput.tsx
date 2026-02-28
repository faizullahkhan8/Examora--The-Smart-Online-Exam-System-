import React, { useState, useRef, useEffect } from "react";
import { IconButton, Button, CircularProgress } from "@mui/material";
import { Paperclip, Smile, Send, Image as ImageIcon, FileText } from "lucide-react";

interface Props {
    conversationId: string;
    onSend: (text: string) => Promise<void>;
    isSending: boolean;
}

const MessageInput: React.FC<Props> = ({ conversationId, onSend, isSending }) => {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [message]);

    // Reset message when conversation changes
    useEffect(() => {
        setMessage("");
    }, [conversationId]);

    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed || isSending) return;
        setMessage("");
        await onSend(trimmed);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-6 bg-white border-t border-slate-200">
            <div className="bg-slate-50 rounded-2xl p-2 flex items-end gap-2 border border-slate-200 focus-within:border-slate-400 transition-all">
                <IconButton size="small" disabled>
                    <Paperclip size={20} className="text-slate-400" />
                </IconButton>
                <IconButton size="small" disabled>
                    <Smile size={20} className="text-slate-400" />
                </IconButton>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Type your message..."
                    className="flex-grow bg-transparent border-none outline-none py-2 px-2 text-sm font-medium resize-none max-h-32"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    variant="contained"
                    className="!bg-slate-900 !text-white !rounded-xl !min-w-0 !p-2 !shadow-none"
                    disabled={!message.trim() || isSending}
                    onClick={handleSend}
                >
                    {isSending ? (
                        <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                        <Send size={20} />
                    )}
                </Button>
            </div>
            <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex gap-4">
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                        <ImageIcon size={12} /> Images
                    </span>
                    <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                        <FileText size={12} /> PDF / Docs
                    </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                    Enter to send · Shift+Enter for new line
                </span>
            </div>
        </div>
    );
};

export default MessageInput;
