import React from "react";
import { CircularProgress } from "@mui/material";
import type { Conversation } from "../../services/messenger/messenger.service";
import ConversationItem from "./ConversationItem";
import MessengerSkeleton from "./MessengerSkeleton";

interface Props {
    conversations: Conversation[];
    isLoading: boolean;
    selectedId: string | null;
    currentUserId: string;
    activeTab: string;
    search: string;
    onSelect: (conv: Conversation) => void;
    onTabChange: (tab: string) => void;
    onSearchChange: (val: string) => void;
}

const TABS = ["All", "Unread", "Groups", "Announcements"];

const ConversationList: React.FC<Props> = ({
    conversations,
    isLoading,
    selectedId,
    currentUserId,
    activeTab,
    search,
    onSelect,
    onTabChange,
    onSearchChange,
}) => {
    const filtered = conversations.filter((conv) => {
        // Tab filter
        if (activeTab === "Groups" && conv.type !== "group") return false;
        if (activeTab === "Announcements" && conv.type !== "announcement")
            return false;

        // Search filter
        if (search) {
            const q = search.toLowerCase();
            const name =
                conv.name?.toLowerCase() ??
                conv.participants
                    .map((p) => `${p.firstName} ${p.lastName}`)
                    .join(" ")
                    .toLowerCase();
            if (!name.includes(q)) return false;
        }

        return true;
    });

    return (
        <div className="flex-grow overflow-y-auto">
            {isLoading ? (
                <MessengerSkeleton rows={5} />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-300">
                    <span className="text-3xl">💬</span>
                    <p className="text-xs font-bold text-slate-400">
                        No conversations found
                    </p>
                </div>
            ) : (
                filtered.map((conv) => (
                    <ConversationItem
                        key={conv._id}
                        conversation={conv}
                        isSelected={selectedId === conv._id}
                        currentUserId={currentUserId}
                        onClick={() => onSelect(conv)}
                    />
                ))
            )}
        </div>
    );
};

export default ConversationList;
