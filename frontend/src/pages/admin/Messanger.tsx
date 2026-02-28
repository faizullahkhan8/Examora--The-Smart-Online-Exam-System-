import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    Avatar,
    IconButton,
    Button,
    Badge,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    TextField,
    InputAdornment,
    Divider,
    Switch,
    Chip,
} from "@mui/material";
import {
    Search,
    Plus,
    Radio,
    Filter,
    MoreVertical,
    Paperclip,
    Smile,
    Send,
    MoreHorizontal,
    Info,
    Users,
    Megaphone,
    Star,
    Check,
    CheckCheck,
    Image as ImageIcon,
    FileText,
    ChevronLeft,
    X,
    VolumeX,
    Trash2,
    LogOut,
    UserPlus,
    ShieldCheck,
    Building2,
    Lock,
} from "lucide-react";

const CONVERSATIONS = [
    {
        id: 1,
        type: "direct",
        name: "Alexander Wright",
        role: "Super Admin",
        institute: "Global HQ",
        lastMessage: "The quarterly audit logs are ready for review.",
        time: "10:45 AM",
        unread: 2,
        online: true,
        avatar: "AW",
    },
    {
        id: 2,
        type: "group",
        name: "CS Department HODs",
        role: "Group",
        institute: "Stanford Technical",
        lastMessage: "Robert: Please upload the new syllabus.",
        time: "9:30 AM",
        unread: 0,
        online: false,
        avatar: "CS",
    },
    {
        id: 3,
        type: "announcement",
        name: "System Maintenance",
        role: "Announcement",
        institute: "All Institutes",
        lastMessage: "Scheduled downtime on Sunday at 2:00 AM EST.",
        time: "Yesterday",
        unread: 0,
        online: true,
        avatar: "📢",
        color: "bg-rose-50 text-rose-600",
    },
    {
        id: 4,
        type: "direct",
        name: "Sarah Jenkins",
        role: "Principal",
        institute: "Oxford International",
        lastMessage: "I have approved the faculty recruitment.",
        time: "Yesterday",
        unread: 0,
        online: true,
        avatar: "SJ",
    },
];

const MOCK_MESSAGES = [
    {
        id: 1,
        sender: "Alexander Wright",
        text: "Hello! Have you reviewed the system logs for the last 24 hours?",
        time: "10:40 AM",
        sent: false,
    },
    {
        id: 2,
        sender: "Me",
        text: "Hi Alexander, I am looking into them right now. I noticed a few failed logins from an unknown IP.",
        time: "10:42 AM",
        sent: true,
        status: "seen",
    },
    {
        id: 3,
        sender: "Alexander Wright",
        text: "The quarterly audit logs are ready for review.",
        time: "10:45 AM",
        sent: false,
    },
];

const Messanger = () => {
    const [activeTab, setActiveTab] = useState("All");
    const [selectedChat, setSelectedChat] = useState(CONVERSATIONS[0]);
    const [showDetails, setShowDetails] = useState(false);
    const [isNewMsgModal, setIsNewMsgModal] = useState(false);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedChat]);

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
            <div className="w-[350px] bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-slate-900">
                            Messaging
                        </h1>
                        <div className="flex gap-1">
                            <Tooltip title="Broadcast (Super Admin)">
                                <IconButton
                                    size="small"
                                    className="text-rose-600 bg-rose-50 hover:bg-rose-100"
                                >
                                    <Megaphone size={18} />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                size="small"
                                onClick={() => setIsNewMsgModal(true)}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Plus size={18} />
                            </IconButton>
                        </div>
                    </div>

                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                            placeholder="Search conversations..."
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                            "All",
                            "Unread",
                            "Groups",
                            "Announcements",
                            "Starred",
                        ].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    activeTab === tab
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {CONVERSATIONS.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-50 relative ${
                                selectedChat?.id === chat.id
                                    ? "bg-slate-50"
                                    : "hover:bg-slate-50/50"
                            }`}
                        >
                            {selectedChat?.id === chat.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                            )}
                            <div className="relative">
                                <Avatar
                                    className={`${chat.color || "bg-slate-900 text-white"} font-black text-xs`}
                                    sx={{ width: 44, height: 44 }}
                                >
                                    {chat.avatar}
                                </Avatar>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className="text-sm font-black text-slate-900 truncate">
                                        {chat.name}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {chat.time}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                        {chat.role}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 truncate tracking-tight">
                                        {chat.institute}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate font-medium">
                                    {chat.type === "announcement" && (
                                        <Megaphone
                                            size={12}
                                            className="inline mr-1 text-rose-500"
                                        />
                                    )}
                                    {chat.lastMessage}
                                </p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col bg-white">
                <div className="h-20 border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Avatar
                            className={`${selectedChat.color || "bg-slate-900 text-white"} font-black text-sm`}
                        >
                            {selectedChat.avatar}
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-slate-900">
                                    {selectedChat.name}
                                </h2>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {selectedChat.role} • {selectedChat.institute}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <IconButton size="small">
                            <Search size={20} className="text-slate-400" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <Info
                                size={20}
                                className={
                                    showDetails
                                        ? "text-slate-900"
                                        : "text-slate-400"
                                }
                            />
                        </IconButton>
                        <IconButton size="small">
                            <MoreVertical
                                size={20}
                                className="text-slate-400"
                            />
                        </IconButton>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[#F8FAFC]/50">
                    <div className="flex justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-4 py-1 rounded-full border border-slate-100">
                            Today
                        </span>
                    </div>

                    {MOCK_MESSAGES.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.sent ? "items-end" : "items-start"}`}
                        >
                            <div
                                className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${
                                    msg.sent
                                        ? "bg-slate-900 text-white rounded-tr-none"
                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                }`}
                            >
                                {msg.text}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 px-1">
                                <span className="text-[10px] font-bold text-slate-400">
                                    {msg.time}
                                </span>
                                {msg.sent &&
                                    (msg.status === "seen" ? (
                                        <CheckCheck
                                            size={12}
                                            className="text-blue-500"
                                        />
                                    ) : (
                                        <Check
                                            size={12}
                                            className="text-slate-300"
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-white border-t border-slate-200">
                    <div className="bg-slate-50 rounded-2xl p-2 flex items-end gap-2 border border-slate-200 focus-within:border-slate-400 transition-all">
                        <IconButton size="small">
                            <Paperclip size={20} className="text-slate-400" />
                        </IconButton>
                        <IconButton size="small">
                            <Smile size={20} className="text-slate-400" />
                        </IconButton>
                        <textarea
                            rows={1}
                            placeholder="Type your message..."
                            className="flex-grow bg-transparent border-none outline-none py-2 px-2 text-sm font-medium resize-none max-h-32"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            className="!bg-slate-900 !text-white !rounded-xl !min-w-0 !p-2 !shadow-none"
                            disabled={!message.trim()}
                        >
                            <Send size={20} />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3 px-2">
                        <div className="flex gap-4">
                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                <ImageIcon size={12} /> Images
                            </span>
                            <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                                <FileText size={12} /> PDF / Docs
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                            Press Enter to send
                        </span>
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="w-[350px] bg-white border-l border-slate-200 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Details
                        </h3>
                        <IconButton
                            size="small"
                            onClick={() => setShowDetails(false)}
                        >
                            <X size={18} />
                        </IconButton>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-8 text-center">
                        <div className="flex flex-col items-center">
                            <Avatar
                                className={`${selectedChat.color || "bg-slate-900 text-white"} font-black text-xl mb-4 shadow-xl`}
                                sx={{ width: 100, height: 100 }}
                            >
                                {selectedChat.avatar}
                            </Avatar>
                            <h2 className="text-lg font-black text-slate-900">
                                {selectedChat.name}
                            </h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                {selectedChat.role}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Chip
                                    icon={<Building2 size={12} />}
                                    label={selectedChat.institute}
                                    size="small"
                                    className="!font-black !text-[10px] !bg-slate-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <VolumeX
                                        size={18}
                                        className="text-slate-400"
                                    />
                                    <span className="text-xs font-bold text-slate-700">
                                        Mute Notifications
                                    </span>
                                </div>
                                <Switch size="small" />
                            </div>
                            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-rose-600">
                                    <Trash2 size={18} />
                                    <span className="text-xs font-bold">
                                        Delete Conversation
                                    </span>
                                </div>
                            </div>
                            {selectedChat.type === "group" && (
                                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-center justify-between text-rose-600">
                                    <div className="flex items-center gap-3">
                                        <LogOut size={18} />
                                        <span className="text-xs font-bold">
                                            Leave Group
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-left space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Shared Files
                                </h4>
                                <span className="text-[10px] font-bold text-slate-900">
                                    View All
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center"
                                    >
                                        <ImageIcon
                                            size={20}
                                            className="text-slate-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Dialog
                open={isNewMsgModal}
                onClose={() => setIsNewMsgModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: "24px" } }}
            >
                <DialogTitle className="!font-black !text-slate-900 !pt-8 !px-8">
                    Create New Message
                </DialogTitle>
                <DialogContent className="!px-8">
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Select Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        id: "direct",
                                        label: "Direct",
                                        icon: Users,
                                    },
                                    {
                                        id: "group",
                                        label: "Group",
                                        icon: UserPlus,
                                    },
                                    {
                                        id: "announcement",
                                        label: "Broadcast",
                                        icon: Megaphone,
                                    },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        className="p-4 rounded-2xl border-2 border-slate-100 hover:border-slate-900 flex flex-col items-center gap-2 transition-all group"
                                    >
                                        <type.icon
                                            size={24}
                                            className="text-slate-400 group-hover:text-slate-900"
                                        />
                                        <span className="text-[10px] font-black uppercase">
                                            {type.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Recipient / Target
                            </label>
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    placeholder="Search by name, role or institute..."
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 items-start">
                            <Lock
                                size={18}
                                className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
                                Role-Based Messaging is active. You can only
                                initiate conversations within your institutional
                                clearance level.
                            </p>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className="!px-8 !pb-8">
                    <Button
                        onClick={() => setIsNewMsgModal(false)}
                        className="!text-slate-400 !font-black !normal-case"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        className="!bg-slate-900 !text-white !rounded-xl !px-6 !font-black !shadow-none"
                    >
                        Next Step
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Messanger;
