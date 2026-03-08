import React, { useState } from "react";
import {
    Avatar,
    Switch,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import {
    Building2,
    VolumeX,
    Trash2,
    LogOut,
    X,
    Users,
    Image as ImageIcon,
    UserPlus,
    UserMinus,
    AlertTriangle,
} from "lucide-react";
import type {
    Conversation,
    ParticipantUser,
} from "../../services/messenger/messenger.service";
import { useRemoveMemberMutation } from "../../services/messenger/messenger.service";
import AddMembersModal from "./AddMembersModal";

interface Props {
    conversation: Conversation;
    currentUserId: string;
    onClose: () => void;
    onDelete: () => void;
}

const ChatDetails: React.FC<Props> = ({
    conversation,
    currentUserId,
    onClose,
    onDelete,
}) => {
    const [addMembersOpen, setAddMembersOpen] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [confirmTarget, setConfirmTarget] = useState<ParticipantUser | null>(null);

    const [removeMember] = useRemoveMemberMutation();

    const isGroup =
        conversation.type === "group" || conversation.type === "announcement";

    const isCreator =
        conversation.type === "group" &&
        String(conversation.createdBy?._id) === String(currentUserId);

    let displayName = "";
    let displayRole = "";
    let displayInstitute = "";
    let initials = "";

    if (conversation.type === "direct") {
        const other = conversation.participants.find(
            (p) => p._id !== currentUserId,
        );
        displayName = other
            ? `${other.firstName} ${other.lastName}`
            : "Unknown User";
        displayRole = other?.role ?? "";
        displayInstitute =
            typeof other?.institute === "object" && other?.institute
                ? other.institute.name
                : "";
        initials = other ? `${other.firstName[0]}${other.lastName[0]}` : "??";
    } else {
        displayName = conversation.name ?? "Group Chat";
        displayRole = conversation.type === "group" ? "Group" : "Broadcast";
        displayInstitute = `${conversation.participants.length} total members`;
    }

    const handleConfirmRemove = async () => {
        if (!confirmTarget) return;
        setRemovingId(confirmTarget._id);
        setConfirmTarget(null);
        try {
            await removeMember({
                conversationId: conversation._id,
                memberId: confirmTarget._id,
            }).unwrap();
        } catch {
            // Error handled globally
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-[72px] px-5 border-b border-(--ui-divider) flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-(--text-primary)">
                    Conversation Info
                </h3>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        color: "var(--text-secondary)",
                        "&:hover": {
                            color: "var(--text-primary)",
                            bgcolor: "var(--bg-base)",
                        },
                    }}
                >
                    <X size={18} />
                </IconButton>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 text-center grow">
                {/* Avatar Profile */}
                <div className="flex flex-col items-center">
                    {conversation.type === "announcement" ? (
                        <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center text-4xl mb-4 border border-rose-100 shadow-sm">
                            📢
                        </div>
                    ) : isGroup ? (
                        <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mb-4 border border-violet-100 shadow-sm">
                            <Users size={32} className="text-violet-600" />
                        </div>
                    ) : (
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                mb: 2,
                                fontSize: "1.75rem",
                                fontWeight: 800,
                            }}
                            className="!bg-(--bg-sidebar) !text-(--text-on-dark) !rounded-2xl !shadow-sm"
                        >
                            {initials}
                        </Avatar>
                    )}
                    <h2 className="text-lg font-bold text-(--text-primary) leading-tight">
                        {displayName}
                    </h2>
                    <p className="text-[11px] font-bold text-(--text-secondary) uppercase tracking-wider mt-1 capitalize">
                        {displayRole}
                    </p>
                    {displayInstitute && (
                        <div className="mt-3 flex gap-2 justify-center">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-(--bg-base) border border-(--ui-border) text-(--text-secondary) px-2.5 py-1 rounded-md">
                                <Building2 size={12} />
                                {displayInstitute}
                            </span>
                        </div>
                    )}
                </div>

                {/* Group Members List */}
                {isGroup && (
                    <div className="text-left space-y-3 pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                                Participants ({conversation.participants.length})
                            </h4>
                            {/* Add Members button — only for group creator */}
                            {isCreator && (
                                <button
                                    onClick={() => setAddMembersOpen(true)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-(--brand-primary) hover:underline outline-none"
                                >
                                    <UserPlus size={12} />
                                    Add Members
                                </button>
                            )}
                        </div>
                        <div className="space-y-1">
                            {conversation.participants.slice(0, 6).map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--bg-base) transition-colors group"
                                >
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            fontSize: "11px",
                                            fontWeight: 700,
                                        }}
                                        className="!bg-(--bg-sidebar) !text-(--text-on-dark)"
                                    >
                                        {p.firstName[0]}
                                        {p.lastName[0]}
                                    </Avatar>
                                    <div className="min-w-0 grow">
                                        <p className="text-xs font-bold text-(--text-primary) truncate flex items-center gap-1.5">
                                            {p.firstName} {p.lastName}
                                            {String(p._id) ===
                                                String(
                                                    conversation.createdBy?._id,
                                                ) && (
                                                <span className="text-[9px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-md shrink-0">
                                                    Creator
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] text-(--text-secondary) font-medium capitalize truncate">
                                            {p.role}
                                        </p>
                                    </div>

                                    {/* Remove button — only creator, only for other members */}
                                    {isCreator &&
                                        String(p._id) !==
                                            String(currentUserId) && (
                                            <button
                                                onClick={() =>
                                                    setConfirmTarget(p)
                                                }
                                                disabled={
                                                    removingId === p._id
                                                }
                                                title="Remove member"
                                                className="ml-auto opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all outline-none disabled:opacity-50 shrink-0"
                                            >
                                                {removingId === p._id ? (
                                                    <CircularProgress
                                                        size={12}
                                                        sx={{
                                                            color: "rgb(239 68 68)",
                                                        }}
                                                    />
                                                ) : (
                                                    <UserMinus size={13} />
                                                )}
                                            </button>
                                        )}
                                </div>
                            ))}
                        </div>
                        {conversation.participants.length > 6 && (
                            <p className="text-[10px] text-(--brand-primary) font-bold text-center cursor-pointer hover:underline">
                                View {conversation.participants.length - 6} more
                                participants
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-(--ui-divider)">
                    <div className="p-3.5 rounded-xl border border-(--ui-border) bg-(--bg-base) flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <VolumeX
                                size={16}
                                className="text-(--text-secondary)"
                            />
                            <span className="text-xs font-bold text-(--text-primary)">
                                Mute Notifications
                            </span>
                        </div>
                        <Switch
                            size="small"
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "var(--brand-primary)",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                    { backgroundColor: "var(--brand-primary)" },
                            }}
                        />
                    </div>

                    {conversation.type === "group" && (
                        <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <LogOut size={16} />
                                <span className="text-xs font-bold">
                                    Leave Group Chat
                                </span>
                            </div>
                        </div>
                    )}

                    <div
                        onClick={onDelete}
                        className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center gap-3 text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors"
                    >
                        <Trash2 size={16} />
                        <span className="text-xs font-bold">
                            Delete Conversation
                        </span>
                    </div>
                </div>

                {/* Shared Files Placeholder */}
                <div className="text-left space-y-3 pt-2 border-t border-(--ui-divider)">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                            Shared Media
                        </h4>
                        <span className="text-[10px] font-bold text-(--brand-primary) cursor-pointer hover:underline">
                            See All
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="aspect-square bg-(--bg-base) rounded-lg border border-(--ui-border) flex items-center justify-center transition-colors hover:border-(--brand-primary) cursor-pointer"
                            >
                                <ImageIcon
                                    size={18}
                                    className="text-(--text-secondary) opacity-50"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Members Modal */}
            <AddMembersModal
                open={addMembersOpen}
                onClose={() => setAddMembersOpen(false)}
                conversationId={conversation._id}
                existingMemberIds={conversation.participants.map((p) => p._id)}
                onMembersAdded={() => setAddMembersOpen(false)}
            />

            {/* Remove Member Confirmation Dialog */}
            <Dialog
                open={!!confirmTarget}
                onClose={() => setConfirmTarget(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        border: "1px solid var(--ui-border)",
                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.15)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        px: 3,
                        pt: 3,
                        pb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-100 shrink-0">
                        <AlertTriangle size={18} className="text-rose-600" />
                    </span>
                    <span className="text-base font-bold text-(--text-primary)">
                        Remove Member
                    </span>
                </DialogTitle>

                <DialogContent sx={{ px: 3, pt: 1.5, pb: 2 }}>
                    <p className="text-sm text-(--text-secondary) leading-relaxed">
                        Are you sure you want to remove{" "}
                        <span className="font-bold text-(--text-primary)">
                            {confirmTarget?.firstName} {confirmTarget?.lastName}
                        </span>{" "}
                        from this group? They will lose access to the
                        conversation immediately.
                    </p>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmTarget(null)}
                        sx={{
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: "8px",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmRemove}
                        sx={{
                            bgcolor: "#ef4444",
                            borderRadius: "8px",
                            px: 3,
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: "#dc2626",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ChatDetails;
