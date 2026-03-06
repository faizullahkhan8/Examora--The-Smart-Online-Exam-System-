import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Tooltip, IconButton, Button } from "@mui/material";
import { Search, Plus, Megaphone, MessageSquare } from "lucide-react";

import {
    useGetConversationsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useDeleteConversationMutation,
} from "../../services/messenger/messenger.service";
import type { Conversation } from "../../services/messenger/messenger.service";

import ConversationList from "../../components/messenger/ConversationList";
import ChatHeader from "../../components/messenger/ChatHeader";
import MessageList from "../../components/messenger/MessageList";
import MessageInput from "../../components/messenger/MessageInput";
import ChatDetails from "../../components/messenger/ChatDetails";
import NewConversationModal from "../../components/messenger/NewConversationModal";

const TABS = ["All", "Unread", "Groups", "Announcements"];

const Messanger = () => {
    const authUser = useSelector((state: any) => state.auth);

    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [isNewMsgModal, setIsNewMsgModal] = useState(false);

    // ─── Conversations ────────────────────────────────────────────────────────
    const {
        data: convsData,
        isLoading: isConvsLoading,
        refetch: refetchConvs,
    } = useGetConversationsQuery();

    const conversations = convsData?.data ?? [];

    // Auto-select first conversation once loaded
    useEffect(() => {
        if (!selectedConv && conversations.length > 0) {
            setSelectedConv(conversations[0]);
        }
    }, [conversations]);

    // Keep selectedConv in sync with freshest data from API
    useEffect(() => {
        if (selectedConv) {
            const fresh = conversations.find((c) => c._id === selectedConv._id);
            if (fresh) setSelectedConv(fresh);
        }
    }, [conversations]);

    // ─── Messages ─────────────────────────────────────────────────────────────
    const {
        data: msgsData,
        isLoading: isMsgsLoading,
    } = useGetMessagesQuery(
        { conversationId: selectedConv?._id ?? "" },
        { skip: !selectedConv, pollingInterval: 5000 },
    );

    const messages = msgsData?.data ?? [];

    // ─── Send Message ─────────────────────────────────────────────────────────
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    const handleSend = useCallback(
        async (text: string) => {
            if (!selectedConv) return;
            await sendMessage({
                conversationId: selectedConv._id,
                text,
            });
        },
        [selectedConv, sendMessage],
    );

    // ─── Delete Conversation ──────────────────────────────────────────────────
    const [deleteConversation] = useDeleteConversationMutation();

    const handleDelete = async () => {
        if (!selectedConv) return;
        await deleteConversation(selectedConv._id);
        setSelectedConv(null);
        setShowDetails(false);
    };

    // ─── New conversation created ─────────────────────────────────────────────
    const handleConversationCreated = (newConvId: string) => {
        refetchConvs().then(({ data }) => {
            const conv = data?.data.find((c) => c._id === newConvId);
            if (conv) setSelectedConv(conv);
        });
    };

    return (
        <div className="flex h-full min-h-screen bg-[var(--bg-base)] overflow-hidden font-sans">
            {/* ─── Sidebar ───────────────────────────────────────────────── */}
            <div className="w-[340px] bg-(--bg-surface) border-r border-(--ui-border) flex flex-col shrink-0 z-10 shadow-sm">
                {/* Header */}
                <div className="p-5 border-b border-(--ui-divider) space-y-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black text-(--text-primary) tracking-tight">
                            Messaging
                        </h1>
                        <div className="flex gap-2">
                            {authUser.role === "admin" && (
                                <Tooltip title="System Broadcast (Admin)">
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsNewMsgModal(true)}
                                        sx={{
                                            bgcolor: "var(--status-danger)",
                                            color: "#fff",
                                            "&:hover": { bgcolor: "darkred" },
                                            boxShadow: "0 2px 4px rgba(225, 29, 72, 0.2)"
                                        }}
                                    >
                                        <Megaphone size={16} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="Start Conversation">
                                <IconButton
                                    size="small"
                                    onClick={() => setIsNewMsgModal(true)}
                                    sx={{
                                        bgcolor: "var(--brand-primary)",
                                        color: "#fff",
                                        "&:hover": { bgcolor: "var(--bg-sidebar)" },
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    <Plus size={16} />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                        />
                        <input
                            className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-all placeholder:text-(--text-secondary)/60 text-(--text-primary)"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab
                                    ? "bg-(--brand-primary) text-white shadow-sm border border-transparent"
                                    : "bg-[var(--bg-base)] text-(--text-secondary) border border-(--ui-border) hover:border-(--brand-primary) hover:text-(--text-primary)"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-base)]">
                    <ConversationList
                        conversations={conversations}
                        isLoading={isConvsLoading}
                        selectedId={selectedConv?._id ?? null}
                        currentUserId={authUser.id}
                        activeTab={activeTab}
                        search={search}
                        onSelect={(conv) => {
                            setSelectedConv(conv);
                            setShowDetails(false);
                        }}
                        onTabChange={setActiveTab}
                        onSearchChange={setSearch}
                    />
                </div>
            </div>

            {/* ─── Chat Area ─────────────────────────────────────────────── */}
            {selectedConv ? (
                <div className="flex-grow flex flex-col bg-(--bg-surface) min-w-0 relative">
                    <ChatHeader
                        conversation={selectedConv}
                        currentUserId={authUser.id}
                        showDetails={showDetails}
                        onToggleDetails={() => setShowDetails((v) => !v)}
                    />

                    <MessageList
                        messages={messages}
                        isLoading={isMsgsLoading}
                        currentUserId={authUser.id}
                    />

                    <MessageInput
                        conversationId={selectedConv._id}
                        onSend={handleSend}
                        isSending={isSending}
                    />
                </div>
            ) : (
                /* Empty state when no conversation selected */
                <div className="flex-grow flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
                    {isConvsLoading ? (
                        <p className="text-sm font-bold text-(--text-secondary) animate-pulse">
                            Loading secure communications...
                        </p>
                    ) : (
                        <div className="flex flex-col items-center max-w-sm px-6">
                            <div className="w-20 h-20 mb-4 rounded-2xl bg-(--bg-surface) border border-(--ui-border) shadow-sm flex items-center justify-center">
                                <MessageSquare size={32} className="text-(--brand-primary) opacity-80" />
                            </div>
                            <div className="text-center space-y-2 mb-6">
                                <p className="text-lg font-black text-(--text-primary)">
                                    Secure Messaging Center
                                </p>
                                <p className="text-sm font-medium text-(--text-secondary) leading-relaxed">
                                    Select an existing conversation from the sidebar panel or initiate a new secure channel.
                                </p>
                            </div>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={16} />}
                                onClick={() => setIsNewMsgModal(true)}
                                sx={{
                                    borderRadius: "8px",
                                    px: 4,
                                    py: 1.25,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    bgcolor: "var(--brand-primary)",
                                    boxShadow: "none",
                                    "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" }
                                }}
                            >
                                Start New Conversation
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Details Panel ─────────────────────────────────────────── */}
            {showDetails && selectedConv && (
                <div className="w-[320px] shrink-0 border-l border-(--ui-border) bg-(--bg-surface) z-20 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    <ChatDetails
                        conversation={selectedConv}
                        currentUserId={authUser.id}
                        onClose={() => setShowDetails(false)}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            {/* ─── New Conversation Modal ─────────────────────────────────── */}
            <NewConversationModal
                open={isNewMsgModal}
                onClose={() => setIsNewMsgModal(false)}
                userRole={authUser.role}
                onCreated={handleConversationCreated}
            />
        </div>
    );
};

export default Messanger;