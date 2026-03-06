import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Avatar,
} from "@mui/material";
import { Search, X, UserPlus } from "lucide-react";
import {
    useSearchUsersQuery,
    useAddMembersMutation,
    type ParticipantUser,
} from "../../services/messenger/messenger.service";

interface Props {
    open: boolean;
    onClose: () => void;
    conversationId: string;
    /** IDs already in the group — we'll exclude them from search results */
    existingMemberIds: string[];
    onMembersAdded: () => void;
}

const AddMembersModal: React.FC<Props> = ({
    open,
    onClose,
    conversationId,
    existingMemberIds,
    onMembersAdded,
}) => {
    const [searchQ, setSearchQ] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<ParticipantUser[]>([]);

    const { data: searchData, isLoading: isSearching } = useSearchUsersQuery(
        searchQ,
        { skip: !open },
    );

    const [addMembers, { isLoading: isAdding }] = useAddMembersMutation();

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setSearchQ("");
            setSelectedUsers([]);
        }
    }, [open]);

    const toggleUser = (user: ParticipantUser) => {
        setSelectedUsers((prev) =>
            prev.find((u) => u._id === user._id)
                ? prev.filter((u) => u._id !== user._id)
                : [...prev, user],
        );
    };

    const handleAdd = async () => {
        if (selectedUsers.length === 0) return;
        try {
            await addMembers({
                conversationId,
                members: selectedUsers.map((u) => u._id),
            }).unwrap();
            onMembersAdded();
            onClose();
        } catch {
            // Error handled globally
        }
    };

    // Filter out users already in the group
    const filteredResults = (searchData?.data ?? []).filter(
        (u) => !existingMemberIds.includes(u._id),
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    border: "1px solid var(--ui-border)",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 800,
                    px: 3,
                    pt: 3,
                    pb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div className="flex items-center gap-2">
                    <UserPlus size={20} className="text-(--brand-primary)" />
                    <span className="text-lg text-(--text-primary)">
                        Add Members
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-(--text-secondary) hover:text-(--status-danger) transition-colors outline-none"
                >
                    <X size={20} />
                </button>
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                <div className="space-y-4 py-2 min-h-[300px]">
                    {/* Selected chips */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-(--bg-base) border border-(--ui-border) rounded-lg min-h-[46px]">
                            {selectedUsers.map((u) => (
                                <span
                                    key={u._id}
                                    className="flex items-center gap-1.5 bg-(--brand-primary) text-white text-xs font-bold px-2.5 py-1 rounded-md"
                                >
                                    {u.firstName} {u.lastName}
                                    <button
                                        onClick={() => toggleUser(u)}
                                        className="hover:text-rose-300 outline-none"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Search input */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                        />
                        <input
                            autoFocus
                            className="w-full bg-(--bg-base) border border-(--ui-border) rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-all"
                            placeholder="Search users by name or email..."
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                        />
                    </div>

                    {/* Results list */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 rounded-lg border border-(--ui-border) bg-(--bg-base) p-1">
                        {isSearching ? (
                            <div className="flex justify-center items-center py-8">
                                <CircularProgress
                                    size={24}
                                    sx={{ color: "var(--brand-primary)" }}
                                />
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <p className="text-center text-xs text-(--text-secondary) py-8 font-medium">
                                {searchQ
                                    ? "No matching users found."
                                    : "Type to search users to add..."}
                            </p>
                        ) : (
                            filteredResults.map((user) => {
                                const isSelected = selectedUsers.some(
                                    (u) => u._id === user._id,
                                );
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUser(user)}
                                        className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${
                                            isSelected
                                                ? "bg-(--brand-primary) text-white shadow-sm"
                                                : "hover:bg-(--bg-surface) text-(--text-primary)"
                                        }`}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                fontSize: "12px",
                                                fontWeight: 800,
                                            }}
                                            className={
                                                isSelected
                                                    ? "bg-white! text-(--brand-primary)!"
                                                    : "bg-(--bg-sidebar)! text-(--text-on-dark)!"
                                            }
                                        >
                                            {user.firstName[0]}
                                            {user.lastName[0]}
                                        </Avatar>
                                        <div className="grow min-w-0">
                                            <p className="text-sm font-bold truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p
                                                className={`text-[10px] capitalize font-semibold truncate ${
                                                    isSelected
                                                        ? "text-white/80"
                                                        : "text-(--text-secondary)"
                                                }`}
                                            >
                                                {user.role} •{" "}
                                                {typeof user.institute ===
                                                    "object" && user.institute
                                                    ? user.institute.name
                                                    : "Unassigned"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                        textTransform: "none",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={selectedUsers.length === 0 || isAdding}
                    onClick={handleAdd}
                    sx={{
                        borderRadius: "8px",
                        px: 3,
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "var(--brand-primary)",
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: "var(--bg-sidebar)",
                            boxShadow: "none",
                        },
                    }}
                >
                    {isAdding ? (
                        <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                        `Add ${selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}Member${selectedUsers.length !== 1 ? "s" : ""}`
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddMembersModal;
