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

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [message]);

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
        <div className="p-5 bg-(--bg-surface) border-t border-(--ui-divider) z-10">
            <div className="bg-(--bg-base) rounded-xl p-2 flex items-end gap-2 border border-(--ui-border) focus-within:border-(--brand-primary) focus-within:ring-1 focus-within:ring-(--brand-primary) transition-all shadow-sm">
                <IconButton size="small" disabled sx={{ color: "var(--text-secondary)" }}>
                    <Paperclip size={18} />
                </IconButton>
                <IconButton size="small" disabled sx={{ color: "var(--text-secondary)" }}>
                    <Smile size={18} />
                </IconButton>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Type a message..."
                    className="grow bg-transparent border-none outline-none py-2 px-2 text-sm font-medium resize-none max-h-32 text-(--text-primary) placeholder:text-(--text-secondary) placeholder:opacity-60 custom-scrollbar"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    variant="contained"
                    disabled={!message.trim() || isSending}
                    onClick={handleSend}
                    sx={{
                        bgcolor: "var(--brand-primary)",
                        color: "#fff",
                        borderRadius: "8px",
                        minWidth: 0,
                        p: 1.25,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" },
                        "&.Mui-disabled": { bgcolor: "var(--ui-border)", color: "var(--text-secondary)" }
                    }}
                >
                    {isSending ? (
                        <CircularProgress size={18} sx={{ color: "white" }} />
                    ) : (
                        <Send size={18} />
                    )}
                </Button>
            </div>
            <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-(--text-secondary) flex items-center gap-1.5 uppercase tracking-wider cursor-not-allowed opacity-70">
                        <ImageIcon size={14} /> Media
                    </span>
                    <span className="text-[10px] font-bold text-(--text-secondary) flex items-center gap-1.5 uppercase tracking-wider cursor-not-allowed opacity-70">
                        <FileText size={14} /> Document
                    </span>
                </div>
                <span className="text-[10px] font-semibold text-(--text-secondary)">
                    <strong className="font-bold">Enter</strong> to send · <strong className="font-bold">Shift+Enter</strong> for line break
                </span>
            </div>
        </div>
    );
};

export default MessageInput;