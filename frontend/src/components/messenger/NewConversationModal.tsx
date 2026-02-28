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
import {
    Users,
    UserPlus,
    Megaphone,
    Search,
    Lock,
    X,
    ChevronLeft,
} from "lucide-react";
import {
    useSearchUsersQuery,
    useCreateConversationMutation,
    type ParticipantUser,
    type CreateConversationPayload,
} from "../../services/messenger/messenger.service";

interface Props {
    open: boolean;
    onClose: () => void;
    userRole: string;
    onCreated: (conversationId: string) => void;
}

type ConvType = "direct" | "group" | "announcement";

const CONV_TYPES = [
    { id: "direct" as ConvType, label: "Direct", icon: Users, desc: "1-on-1 message" },
    { id: "group" as ConvType, label: "Group", icon: UserPlus, desc: "Multiple people" },
    {
        id: "announcement" as ConvType,
        label: "Broadcast",
        icon: Megaphone,
        desc: "Admin only",
        adminOnly: true,
    },
];

const NewConversationModal: React.FC<Props> = ({
    open,
    onClose,
    userRole,
    onCreated,
}) => {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<ConvType | null>(null);
    const [groupName, setGroupName] = useState("");
    const [searchQ, setSearchQ] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<ParticipantUser[]>([]);

    const { data: searchData, isLoading: isSearching } = useSearchUsersQuery(
        searchQ,
        { skip: !open || step !== 2 },
    );
    const [createConversation, { isLoading: isCreating }] =
        useCreateConversationMutation();

    // Reset on close
    useEffect(() => {
        if (!open) {
            setStep(1);
            setSelectedType(null);
            setGroupName("");
            setSearchQ("");
            setSelectedUsers([]);
        }
    }, [open]);

    const toggleUser = (user: ParticipantUser) => {
        if (selectedType === "direct") {
            // For direct, only one recipient
            setSelectedUsers([user]);
        } else {
            setSelectedUsers((prev) =>
                prev.find((u) => u._id === user._id)
                    ? prev.filter((u) => u._id !== user._id)
                    : [...prev, user],
            );
        }
    };

    const handleCreate = async () => {
        if (!selectedType || selectedUsers.length === 0) return;

        const payload: CreateConversationPayload = {
            type: selectedType,
            participants: selectedUsers.map((u) => u._id),
        };
        if (
            (selectedType === "group" || selectedType === "announcement") &&
            groupName.trim()
        ) {
            payload.name = groupName.trim();
        }

        try {
            const result = await createConversation(payload).unwrap();
            onCreated(result.data._id);
            onClose();
        } catch (e) {
            // error handled by RTK
        }
    };

    const canProceed =
        step === 1
            ? selectedType !== null
            : selectedUsers.length > 0 &&
            (selectedType === "direct" ||
                groupName.trim().length > 0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: "24px" } }}
        >
            <DialogTitle className="!font-black !text-slate-900 !pt-8 !px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="mr-1 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <span>
                        {step === 1 ? "New Conversation" : "Add Recipients"}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                    <X size={20} />
                </button>
            </DialogTitle>

            <DialogContent className="!px-8">
                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Select Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {CONV_TYPES.map((type) => {
                                    const isDisabled =
                                        type.adminOnly && userRole !== "admin";
                                    return (
                                        <button
                                            key={type.id}
                                            disabled={isDisabled}
                                            onClick={() =>
                                                setSelectedType(type.id)
                                            }
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group ${isDisabled
                                                    ? "border-slate-100 opacity-40 cursor-not-allowed"
                                                    : selectedType === type.id
                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                        : "border-slate-100 hover:border-slate-900"
                                                }`}
                                        >
                                            <type.icon
                                                size={24}
                                                className={
                                                    selectedType === type.id
                                                        ? "text-white"
                                                        : "text-slate-400 group-hover:text-slate-900"
                                                }
                                            />
                                            <span className="text-[10px] font-black uppercase">
                                                {type.label}
                                            </span>
                                            <span
                                                className={`text-[9px] font-medium ${selectedType === type.id
                                                        ? "text-slate-300"
                                                        : "text-slate-400"
                                                    }`}
                                            >
                                                {type.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Group / Announcement name */}
                        {(selectedType === "group" ||
                            selectedType === "announcement") && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {selectedType === "group"
                                            ? "Group Name"
                                            : "Broadcast Title"}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={
                                            selectedType === "group"
                                                ? "e.g. CS HOD Team"
                                                : "e.g. System Maintenance"
                                        }
                                        value={groupName}
                                        onChange={(e) =>
                                            setGroupName(e.target.value)
                                        }
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    />
                                </div>
                            )}

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                            <Lock
                                size={18}
                                className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
                                Role-Based Messaging is active. Broadcast
                                feature is limited to admins.
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-4">
                        {/* Selected users */}
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map((u) => (
                                    <span
                                        key={u._id}
                                        className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                                    >
                                        {u.firstName} {u.lastName}
                                        <button
                                            onClick={() => toggleUser(u)}
                                            className="hover:text-slate-300"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                autoFocus
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                placeholder="Search by name, role or email..."
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                            />
                        </div>

                        {/* Results */}
                        <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-1">
                            {isSearching ? (
                                <div className="flex justify-center items-center py-6">
                                    <CircularProgress
                                        size={24}
                                        sx={{ color: "#1e293b" }}
                                    />
                                </div>
                            ) : (searchData?.data ?? []).length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-6 font-medium">
                                    {searchQ
                                        ? "No users found"
                                        : "Start typing to search users..."}
                                </p>
                            ) : (
                                (searchData?.data ?? []).map((user) => {
                                    const isSelected = selectedUsers.some(
                                        (u) => u._id === user._id,
                                    );
                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleUser(user)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                                    ? "bg-slate-900 text-white"
                                                    : "hover:bg-white"
                                                }`}
                                        >
                                            <Avatar
                                                sx={{ width: 32, height: 32 }}
                                                className={`text-xs font-black ${isSelected
                                                        ? "bg-white text-slate-900"
                                                        : "bg-slate-900 text-white"
                                                    }`}
                                            >
                                                {user.firstName[0]}
                                                {user.lastName[0]}
                                            </Avatar>
                                            <div className="flex-grow min-w-0">
                                                <p
                                                    className={`text-sm font-bold truncate ${isSelected
                                                            ? "text-white"
                                                            : "text-slate-800"
                                                        }`}
                                                >
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                </p>
                                                <p
                                                    className={`text-[10px] capitalize font-medium ${isSelected
                                                            ? "text-slate-300"
                                                            : "text-slate-400"
                                                        }`}
                                                >
                                                    {user.role} ·{" "}
                                                    {typeof user.institute ===
                                                        "object" &&
                                                        user.institute
                                                        ? user.institute.name
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>

            <DialogActions className="!px-8 !pb-8 gap-2">
                <Button
                    onClick={onClose}
                    className="!text-slate-400 !font-black !normal-case"
                >
                    Cancel
                </Button>
                {step === 1 ? (
                    <Button
                        variant="contained"
                        disabled={!canProceed}
                        onClick={() => setStep(2)}
                        className="!bg-slate-900 !text-white !rounded-xl !px-6 !font-black !shadow-none !normal-case"
                    >
                        Next Step
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        disabled={!canProceed || isCreating}
                        onClick={handleCreate}
                        className="!bg-slate-900 !text-white !rounded-xl !px-6 !font-black !shadow-none !normal-case"
                    >
                        {isCreating ? (
                            <CircularProgress
                                size={16}
                                sx={{ color: "white" }}
                            />
                        ) : (
                            "Start Conversation"
                        )}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default NewConversationModal;
