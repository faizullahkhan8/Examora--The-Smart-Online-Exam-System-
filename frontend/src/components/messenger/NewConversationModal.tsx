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
    { id: "group" as ConvType, label: "Group", icon: UserPlus, desc: "Multiple members" },
    { id: "announcement" as ConvType, label: "Broadcast", icon: Megaphone, desc: "Admin only", adminOnly: true },
];

const NewConversationModal: React.FC<Props> = ({ open, onClose, userRole, onCreated }) => {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState<ConvType | null>(null);
    const [groupName, setGroupName] = useState("");
    const [searchQ, setSearchQ] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<ParticipantUser[]>([]);

    const { data: searchData, isLoading: isSearching } = useSearchUsersQuery(searchQ, { skip: !open || step !== 2 });
    const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();

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
        if ((selectedType === "group" || selectedType === "announcement") && groupName.trim()) {
            payload.name = groupName.trim();
        }

        try {
            const result = await createConversation(payload).unwrap();
            onCreated(result.data._id);
            onClose();
        } catch (e) {
            // Error handled globally
        }
    };

    const canProceed = step === 1
        ? selectedType !== null && (selectedType === "direct" || groupName.trim().length > 0)
        : selectedUsers.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px", border: "1px solid var(--ui-border)", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}>
            <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="flex items-center gap-2">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="mr-1 text-(--text-secondary) hover:text-(--text-primary) transition-colors outline-none">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <span className="text-lg text-(--text-primary)">
                        {step === 1 ? "Start Communication" : "Select Recipients"}
                    </span>
                </div>
                <button onClick={onClose} className="text-(--text-secondary) hover:text-(--status-danger) transition-colors outline-none">
                    <X size={20} />
                </button>
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                {step === 1 && (
                    <div className="space-y-6 py-2">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                                Channel Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {CONV_TYPES.map((type) => {
                                    const isDisabled = type.adminOnly && userRole !== "admin";
                                    return (
                                        <button
                                            key={type.id}
                                            disabled={isDisabled}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all outline-none ${isDisabled
                                                ? "border-(--ui-border) opacity-40 cursor-not-allowed bg-[var(--bg-base)]"
                                                : selectedType === type.id
                                                    ? "border-(--brand-primary) bg-(--brand-primary) text-white shadow-md"
                                                    : "border-(--ui-border) bg-(--bg-surface) hover:border-(--brand-primary)"
                                                }`}
                                        >
                                            <type.icon size={22} className={selectedType === type.id ? "text-white" : "text-(--text-secondary)"} />
                                            <span className="text-[11px] font-bold uppercase tracking-wider mt-1">{type.label}</span>
                                            <span className={`text-[10px] font-medium ${selectedType === type.id ? "text-white/80" : "text-(--text-secondary)"}`}>
                                                {type.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {(selectedType === "group" || selectedType === "announcement") && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-(--text-secondary)">
                                    {selectedType === "group" ? "Group Title" : "Broadcast Subject"} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={selectedType === "group" ? "e.g. Faculty Discussion" : "e.g. Server Maintenance Alert"}
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-all"
                                />
                            </div>
                        )}

                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                            <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-semibold text-amber-800 leading-relaxed">
                                Role-Based Access Control is enforced. System-wide broadcasts are strictly limited to administrators.
                            </p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 py-2 min-h-[300px]">
                        {selectedUsers.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-2 bg-[var(--bg-base)] border border-(--ui-border) rounded-lg min-h-[46px]">
                                {selectedUsers.map((u) => (
                                    <span key={u._id} className="flex items-center gap-1.5 bg-(--brand-primary) text-white text-xs font-bold px-2.5 py-1 rounded-md">
                                        {u.firstName} {u.lastName}
                                        <button onClick={() => toggleUser(u)} className="hover:text-rose-300 outline-none"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                            <input
                                autoFocus
                                className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-all"
                                placeholder="Search system users by name or email..."
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 rounded-lg border border-(--ui-border) bg-[var(--bg-base)] p-1">
                            {isSearching ? (
                                <div className="flex justify-center items-center py-8">
                                    <CircularProgress size={24} sx={{ color: "var(--brand-primary)" }} />
                                </div>
                            ) : (searchData?.data ?? []).length === 0 ? (
                                <p className="text-center text-xs text-(--text-secondary) py-8 font-medium">
                                    {searchQ ? "No matching users found." : "Type to fetch user directory..."}
                                </p>
                            ) : (
                                (searchData?.data ?? []).map((user) => {
                                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleUser(user)}
                                            className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${isSelected
                                                ? "bg-(--brand-primary) text-white shadow-sm"
                                                : "hover:bg-(--bg-surface) text-(--text-primary)"
                                                }`}
                                        >
                                            <Avatar sx={{ width: 32, height: 32, fontSize: "12px", fontWeight: 800 }} className={isSelected ? "!bg-white !text-(--brand-primary)" : "!bg-(--bg-sidebar) !text-(--text-on-dark)"}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </Avatar>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-bold truncate">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className={`text-[10px] capitalize font-semibold truncate ${isSelected ? "text-white/80" : "text-(--text-secondary)"}`}>
                                                    {user.role} • {typeof user.institute === "object" && user.institute ? user.institute.name : "Unassigned"}
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

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
                <Button onClick={onClose} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>
                    Cancel
                </Button>
                {step === 1 ? (
                    <Button
                        variant="contained"
                        disabled={!canProceed}
                        onClick={() => setStep(2)}
                        sx={{ borderRadius: "8px", px: 3, textTransform: "none", fontWeight: 700, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}
                    >
                        Proceed to Select
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        disabled={!canProceed || isCreating}
                        onClick={handleCreate}
                        sx={{ borderRadius: "8px", px: 3, textTransform: "none", fontWeight: 700, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}
                    >
                        {isCreating ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Initialize Channel"}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default NewConversationModal;