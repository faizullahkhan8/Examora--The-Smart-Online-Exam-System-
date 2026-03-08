import React, { useState, useRef, useEffect } from "react";
import { Avatar, IconButton } from "@mui/material";
import { Search, Info, Users, X, ChevronUp, ChevronDown } from "lucide-react";
import type { Conversation, Message } from "../../services/messenger/messenger.service";

interface Props {
    conversation: Conversation;
    currentUserId: string;
    showDetails: boolean;
    onToggleDetails: () => void;
    // ── Search ──────────────────────────────────────────────────────────────
    messages: Message[];
    onSearchMatch: (matchedIds: string[], currentIndex: number, query: string) => void;
    onSearchClose: () => void;
}

const ChatHeader: React.FC<Props> = ({
    conversation,
    currentUserId,
    showDetails,
    onToggleDetails,
    messages,
    onSearchMatch,
    onSearchClose,
}) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [matchIndex, setMatchIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Compute matches whenever query or messages change
    const matches = React.useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return messages.filter((m) => m.text.toLowerCase().includes(q));
    }, [query, messages]);

    // Notify parent whenever matches or index change
    useEffect(() => {
        if (query.trim()) {
            onSearchMatch(
                matches.map((m) => m._id),
                matchIndex,
                query,
            );
        } else {
            onSearchMatch([], 0, "");
        }
    }, [matches, matchIndex, query]);

    // Reset index when new query changes matches
    useEffect(() => {
        setMatchIndex(0);
    }, [query]);

    const openSearch = () => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setQuery("");
        setMatchIndex(0);
        onSearchClose();
    };

    const goNext = () =>
        setMatchIndex((i) => (matches.length ? (i + 1) % matches.length : 0));

    const goBack = () =>
        setMatchIndex((i) =>
            matches.length ? (i - 1 + matches.length) % matches.length : 0,
        );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") goNext();
        if (e.key === "Escape") closeSearch();
    };

    // ── Display data ─────────────────────────────────────────────────────────
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
        initials = other ? `${other.firstName[0]}${other.lastName[0]}` : "??";
        isOnline = other?.isActive ?? false;
    } else if (conversation.type === "group") {
        name = conversation.name ?? "Group Chat";
        subtitle = `${conversation.participants.length} members`;
        isGroup = true;
    } else {
        name = conversation.name ?? "Announcement";
        subtitle = "System Broadcast Channel";
        isOnline = true;
    }

    return (
        <div className="h-[72px] border-b border-(--ui-divider) px-6 flex items-center justify-between shrink-0 bg-(--bg-surface) shadow-sm z-10">
            {/* Left — avatar + name */}
            <div className="flex items-center gap-4 min-w-0">
                {conversation.type === "announcement" ? (
                    <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-xl shadow-sm border border-rose-100 shrink-0">
                        📢
                    </div>
                ) : isGroup ? (
                    <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shadow-sm border border-violet-100 shrink-0">
                        <Users size={20} className="text-violet-600" />
                    </div>
                ) : (
                    <Avatar
                        sx={{ width: 44, height: 44 }}
                        className="!bg-(--bg-sidebar) !text-(--text-on-dark) font-bold! !text-sm rounded-xl! !shadow-sm shrink-0"
                    >
                        {initials}
                    </Avatar>
                )}
                <div className="flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-bold text-(--text-primary) tracking-tight leading-tight truncate">
                            {name}
                        </h2>
                        {isOnline && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0" />
                        )}
                    </div>
                    <p className="text-[11px] font-semibold text-(--text-secondary) capitalize mt-0.5 truncate">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Right — search bar / buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
                {searchOpen ? (
                    /* ── Inline search bar ────────────────────────────── */
                    <div className="flex items-center gap-2 bg-(--bg-base) border border-(--ui-border) rounded-lg px-3 py-1.5 transition-all shadow-sm">
                        <Search
                            size={14}
                            className="text-(--text-secondary) shrink-0"
                        />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search messages…"
                            className="w-44 bg-transparent text-sm font-medium text-(--text-primary) outline-none placeholder:text-(--text-secondary)/60"
                        />

                        {/* Match counter */}
                        {query.trim() && (
                            <span className="text-[11px] font-bold text-(--text-secondary) whitespace-nowrap shrink-0">
                                {matches.length === 0
                                    ? "0 / 0"
                                    : `${matchIndex + 1} / ${matches.length}`}
                            </span>
                        )}

                        {/* Navigate */}
                        <div className="flex items-center gap-0.5">
                            <IconButton
                                size="small"
                                disabled={matches.length === 0}
                                onClick={goBack}
                                sx={{
                                    p: "2px",
                                    color: "var(--text-secondary)",
                                    "&:hover": { color: "var(--brand-primary)" },
                                    "&.Mui-disabled": { opacity: 0.3 },
                                }}
                            >
                                <ChevronUp size={14} />
                            </IconButton>
                            <IconButton
                                size="small"
                                disabled={matches.length === 0}
                                onClick={goNext}
                                sx={{
                                    p: "2px",
                                    color: "var(--text-secondary)",
                                    "&:hover": { color: "var(--brand-primary)" },
                                    "&.Mui-disabled": { opacity: 0.3 },
                                }}
                            >
                                <ChevronDown size={14} />
                            </IconButton>
                        </div>

                        {/* Close */}
                        <IconButton
                            size="small"
                            onClick={closeSearch}
                            sx={{
                                p: "2px",
                                color: "var(--text-secondary)",
                                "&:hover": {
                                    color: "var(--status-danger)",
                                    bgcolor: "transparent",
                                },
                            }}
                        >
                            <X size={14} />
                        </IconButton>
                    </div>
                ) : (
                    /* ── Normal search icon ───────────────────────────── */
                    <IconButton
                        size="small"
                        onClick={openSearch}
                        sx={{
                            color: "var(--text-secondary)",
                            "&:hover": {
                                color: "var(--text-primary)",
                                bgcolor: "var(--bg-base)",
                            },
                        }}
                    >
                        <Search size={18} />
                    </IconButton>
                )}

                <IconButton
                    size="small"
                    onClick={onToggleDetails}
                    sx={{
                        color: showDetails
                            ? "var(--brand-primary)"
                            : "var(--text-secondary)",
                        bgcolor: showDetails
                            ? "var(--brand-active)"
                            : "transparent",
                        "&:hover": {
                            color: "var(--brand-primary)",
                            bgcolor: "var(--bg-base)",
                        },
                    }}
                >
                    <Info size={18} />
                </IconButton>
            </div>
        </div>
    );
};

export default ChatHeader;
