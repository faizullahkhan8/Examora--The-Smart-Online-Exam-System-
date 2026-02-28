import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Tooltip, IconButton } from "@mui/material";
import { Search, Plus, Megaphone } from "lucide-react";

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
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            {/* ─── Sidebar ───────────────────────────────────────────────── */}
            <div className="w-[340px] bg-white border-r border-slate-200 flex flex-col shrink-0">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-slate-900">
                            Messaging
                        </h1>
                        <div className="flex gap-1">
                            {authUser.role === "admin" && (
                                <Tooltip title="Broadcast (Admin)">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setIsNewMsgModal(true);
                                        }}
                                        className="!text-rose-600 !bg-rose-50 hover:!bg-rose-100"
                                    >
                                        <Megaphone size={18} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Tooltip title="New Conversation">
                                <IconButton
                                    size="small"
                                    onClick={() => setIsNewMsgModal(true)}
                                    className="!bg-slate-900 !text-white hover:!bg-slate-800"
                                >
                                    <Plus size={18} />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation list */}
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

            {/* ─── Chat Area ─────────────────────────────────────────────── */}
            {selectedConv ? (
                <div className="flex-grow flex flex-col bg-white min-w-0">
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
                <div className="flex-grow flex flex-col items-center justify-center gap-4 bg-[#F8FAFC] text-slate-300">
                    {isConvsLoading ? (
                        <p className="text-sm font-bold text-slate-400">
                            Loading conversations...
                        </p>
                    ) : (
                        <>
                            <span className="text-7xl">💬</span>
                            <div className="text-center space-y-1">
                                <p className="text-base font-black text-slate-500">
                                    No conversation selected
                                </p>
                                <p className="text-sm font-medium text-slate-400">
                                    Select a conversation from the sidebar or
                                    start a new one.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsNewMsgModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} />
                                New Conversation
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* ─── Details Panel ─────────────────────────────────────────── */}
            {showDetails && selectedConv && (
                <ChatDetails
                    conversation={selectedConv}
                    currentUserId={authUser.id}
                    onClose={() => setShowDetails(false)}
                    onDelete={handleDelete}
                />
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
