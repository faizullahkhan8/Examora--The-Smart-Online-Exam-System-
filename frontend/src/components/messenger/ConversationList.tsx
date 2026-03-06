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

const ConversationList: React.FC<Props> = ({
    conversations,
    isLoading,
    selectedId,
    currentUserId,
    activeTab,
    search,
    onSelect,
}) => {
    const filtered = conversations.filter((conv) => {
        // Tab filter
        if (activeTab === "Groups" && conv.type !== "group") return false;
        if (activeTab === "Announcements" && conv.type !== "announcement") return false;

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
        <div className="grow overflow-y-auto custom-scrollbar">
            {isLoading ? (
                <MessengerSkeleton rows={5} />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-(--text-secondary) opacity-60">
                    <span className="text-3xl">💬</span>
                    <p className="text-xs font-semibold">
                        No conversations found
                    </p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {filtered.map((conv) => (
                        <ConversationItem
                            key={conv._id}
                            conversation={conv}
                            isSelected={selectedId === conv._id}
                            currentUserId={currentUserId}
                            onClick={() => onSelect(conv)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConversationList;