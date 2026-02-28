import React, { useState, useMemo } from "react";
import {
    IconButton,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    Tooltip,
    Menu,
    MenuItem,
    Checkbox,
    TablePagination,
} from "@mui/material";
import {
    Users,
    UserPlus,
    FileUp,
    Download,
    Search,
    MoreVertical,
    ChevronRight,
    ShieldCheck,
    Building2,
    Mail,
    Lock,
    Eye,
    Edit2,
    UserX,
    Trash2,
    X,
    CheckCircle2,
    RefreshCcw,
    ChevronLeft,
} from "lucide-react";

const ROLE_CONFIG = {
    "Super Admin": {
        color: "bg-purple-50 text-purple-600 border-purple-100",
        icon: ShieldCheck,
    },
    Principal: {
        color: "bg-blue-50 text-blue-600 border-blue-100",
        icon: Building2,
    },
    HOD: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Users },
    Faculty: {
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: Users,
    },
    Student: {
        color: "bg-slate-50 text-slate-600 border-slate-100",
        icon: Users,
    },
};

const MOCK_USERS = [
    {
        id: 1,
        name: "Alexander Wright",
        email: "alex.w@system.com",
        phone: "+1 234 567 890",
        role: "Super Admin",
        institute: "Global HQ",
        dept: "All",
        status: "Active",
        lastLogin: "10 mins ago",
        created: "2023-01-15",
    },
    {
        id: 2,
        name: "Sarah Jenkins",
        email: "s.jenkins@oxford.edu",
        phone: "+44 7700 9000",
        role: "Principal",
        institute: "Oxford International",
        dept: "Administration",
        status: "Active",
        lastLogin: "2 hours ago",
        created: "2023-05-10",
    },
    {
        id: 3,
        name: "Robert Chen",
        email: "r.chen@stanford.edu",
        phone: "+1 650 443 221",
        role: "HOD",
        institute: "Stanford Technical",
        dept: "Computer Science",
        status: "Active",
        lastLogin: "1 day ago",
        created: "2023-08-22",
    },
    {
        id: 4,
        name: "Elena Rodriguez",
        email: "e.rod@berlin.de",
        phone: "+49 30 123456",
        role: "Faculty",
        institute: "Berlin Academy",
        dept: "Arts & Design",
        status: "Suspended",
        lastLogin: "3 weeks ago",
        created: "2024-01-05",
    },
    {
        id: 5,
        name: "James Wilson",
        email: "j.wilson@tokyo.jp",
        phone: "+81 3 555 0199",
        role: "Student",
        institute: "Tokyo Science Poly",
        dept: "Engineering",
        status: "Active",
        lastLogin: "5 mins ago",
        created: "2024-02-12",
    },
];

const KPI_STATS = [
    { label: "Total Users", count: "12,840", growth: "+14%", role: "All" },
    { label: "Super Admins", count: "5", growth: "0%", role: "Super Admin" },
    { label: "Principals", count: "48", growth: "+2", role: "Principal" },
    {
        label: "Active Students",
        count: "10,200",
        growth: "+18%",
        role: "Student",
    },
];

const UserManagement: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const filteredUsers = useMemo(
        () =>
            MOCK_USERS.filter(
                (u) =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [searchTerm],
    );

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        );
    }, [filteredUsers, page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="flex-grow bg-(--bg-base) min-h-screen">
            <header className="h-20 bg-(--bg-surface) border-b border-(--ui-border) px-8 flex items-center justify-between sticky top-0 z-40">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-(--text-secondary) uppercase tracking-widest mb-1">
                        <span>Dashboard</span>
                        <ChevronRight size={10} />
                        <span className="text-(--text-primary)">Users</span>
                    </div>
                    <h1 className="text-xl font-black text-(--text-primary)">
                        User Management
                    </h1>
                    <p className="text-[11px] text-(--text-secondary) font-medium tracking-tight">
                        Manage all system users across institutes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outlined"
                        startIcon={<Download size={16} />}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            borderColor: "var(--ui-border)",
                            color: "var(--text-primary)",
                        }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FileUp size={16} />}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            borderColor: "var(--ui-border)",
                            color: "var(--text-primary)",
                        }}
                    >
                        Import CSV
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<UserPlus size={16} />}
                        onClick={() => {
                            setIsCreateModalOpen(true);
                            setActiveStep(0);
                        }}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "var(--brand-primary)",
                            boxShadow: "none",
                        }}
                    >
                        Create User
                    </Button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {KPI_STATS.map((kpi, i) => (
                        <div
                            key={i}
                            className="bg-(--bg-surface) p-5 rounded-2xl border border-(--ui-border) shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div
                                    className={`p-2 rounded-xl ${ROLE_CONFIG[kpi.role as keyof typeof ROLE_CONFIG]?.color || "bg-slate-50 text-slate-500"}`}
                                >
                                    <Users size={20} />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {kpi.growth}
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                {kpi.label}
                            </p>
                            <h3 className="text-2xl font-black text-(--text-primary) mt-1">
                                {kpi.count}
                            </h3>
                        </div>
                    ))}
                </div>

                <div className="bg-(--bg-surface) rounded-2xl border border-(--ui-border) shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-(--ui-divider) space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or phone..."
                                    className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--brand-primary)"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                            <select className="bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm font-semibold outline-none">
                                <option>All Roles</option>
                                <option>Super Admin</option>
                                <option>Principal</option>
                                <option>HOD</option>
                                <option>Faculty</option>
                                <option>Student</option>
                            </select>
                            <select className="bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm font-semibold outline-none">
                                <option>All Institutes</option>
                            </select>
                            <Button
                                startIcon={<RefreshCcw size={16} />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--bg-base)/50 border-b border-(--ui-divider)">
                                    <th className="px-6 py-4 w-10">
                                        <Checkbox size="small" />
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        User Profile
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Role & Security
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Institutional Context
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {paginatedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-(--bg-base)/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <Checkbox size="small" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        bgcolor:
                                                            "var(--bg-sidebar)",
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {user.name.charAt(0)}
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-bold text-(--text-primary)">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-(--text-secondary) font-medium">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border w-fit ${ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.color}`}
                                                >
                                                    {user.role}
                                                </span>
                                                <p className="text-[10px] text-(--text-secondary) font-medium">
                                                    Last Login: {user.lastLogin}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-(--text-primary)">
                                                    {user.institute}
                                                </p>
                                                <p className="text-[10px] text-(--text-secondary) font-semibold uppercase">
                                                    {user.dept}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${user.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setSelectedUser(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        <Eye size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small">
                                                        <Edit2 size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) =>
                                                        setAnchorEl(
                                                            e.currentTarget,
                                                        )
                                                    }
                                                >
                                                    <MoreVertical size={18} />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{
                            borderTop: "1px solid var(--ui-divider)",
                            ".MuiTablePagination-toolbar": {
                                minHeight: "64px",
                            },
                            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                                {
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    color: "var(--text-secondary)",
                                },
                        }}
                    />
                </div>
            </div>

            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[520px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedUser ? "translate-x-0" : "translate-x-full"}`}
            >
                {selectedUser && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-(--ui-divider) flex items-center justify-between bg-(--bg-base)/30">
                            <h2 className="text-lg font-black text-(--text-primary) tracking-tight">
                                User Dossier
                            </h2>
                            <IconButton onClick={() => setSelectedUser(null)}>
                                <X size={20} />
                            </IconButton>
                        </div>
                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col items-center text-center">
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mb: 2,
                                        fontSize: "2rem",
                                        fontWeight: 900,
                                        bgcolor: "var(--brand-primary)",
                                    }}
                                >
                                    {selectedUser.name.charAt(0)}
                                </Avatar>
                                <h3 className="text-xl font-black text-(--text-primary)">
                                    {selectedUser.name}
                                </h3>
                                <p className="text-sm text-(--text-secondary) font-bold uppercase tracking-widest">
                                    {selectedUser.role}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-2xl border border-(--ui-divider) bg-(--bg-base)/20 flex items-center gap-4">
                                    <Mail
                                        size={18}
                                        className="text-(--text-secondary)"
                                    />
                                    <div>
                                        <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-tighter">
                                            Email Address
                                        </p>
                                        <p className="text-sm font-bold text-(--text-primary)">
                                            {selectedUser.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-(--ui-divider) bg-(--bg-base)/20 flex items-center gap-4">
                                    <Building2
                                        size={18}
                                        className="text-(--text-secondary)"
                                    />
                                    <div>
                                        <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-tighter">
                                            Primary Institute
                                        </p>
                                        <p className="text-sm font-bold text-(--text-primary)">
                                            {selectedUser.institute}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-(--ui-divider) pb-2">
                                    <h4 className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Permission Matrix
                                    </h4>
                                    <span className="text-[10px] font-bold text-(--brand-primary) cursor-pointer">
                                        View Full Matrix
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        "Manage Users",
                                        "Approve Admissions",
                                        "Configure Roles",
                                        "View Reports",
                                    ].map((p) => (
                                        <div
                                            key={p}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100"
                                        >
                                            <CheckCircle2
                                                size={12}
                                                className="text-emerald-500"
                                            />
                                            <span className="text-[10px] font-bold text-emerald-700">
                                                {p}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<RefreshCcw size={18} />}
                                    sx={{
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        bgcolor: "var(--brand-primary)",
                                        py: 1.5,
                                        boxShadow: "none",
                                    }}
                                >
                                    Reset Password
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<UserX size={18} />}
                                    color="error"
                                    sx={{
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        py: 1.5,
                                    }}
                                >
                                    Suspend Account
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: "24px" } }}
            >
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>
                    Provision New User
                </DialogTitle>
                <DialogContent sx={{ px: 4 }}>
                    <Stepper activeStep={activeStep} sx={{ my: 4 }}>
                        {["Identity", "Role", "Access", "Review"].map(
                            (label) => (
                                <Step key={label}>
                                    <StepLabel
                                        sx={{
                                            "& .MuiStepLabel-label": {
                                                fontSize: "9px",
                                                fontWeight: 900,
                                                textTransform: "uppercase",
                                            },
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ),
                        )}
                    </Stepper>

                    <div className="py-4 min-h-[340px]">
                        {activeStep === 0 && (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Full Legal Name
                                    </label>
                                    <input
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                            Email Address
                                        </label>
                                        <input
                                            className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                            placeholder="john@institute.edu"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                            Contact Number
                                        </label>
                                        <input
                                            className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                            placeholder="+1..."
                                        />
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
                                    <Lock
                                        size={18}
                                        className="text-blue-500 shrink-0"
                                    />
                                    <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
                                        Password will be automatically generated
                                        and sent to the provided email address
                                        upon account activation.
                                    </p>
                                </div>
                            </div>
                        )}
                        {activeStep === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        System Role
                                    </label>
                                    <select className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none">
                                        <option>Select Role...</option>
                                        <option>Super Admin</option>
                                        <option>Principal</option>
                                        <option>HOD</option>
                                        <option>Faculty</option>
                                        <option>Student</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Primary Institute
                                    </label>
                                    <select className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none">
                                        <option>Search Institute...</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        {activeStep === 3 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-xl font-black text-(--text-primary)">
                                    Account Ready
                                </h4>
                                <p className="text-sm text-(--text-secondary) font-medium max-w-[320px]">
                                    A secure invitation link will be sent to the
                                    user. They must complete 2FA setup upon
                                    first login.
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button
                        onClick={() => setIsCreateModalOpen(false)}
                        sx={{ color: "var(--text-secondary)", fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <div className="flex-grow" />
                    {activeStep > 0 && (
                        <Button
                            onClick={() => setActiveStep((prev) => prev - 1)}
                            sx={{
                                fontWeight: 700,
                                color: "var(--text-primary)",
                            }}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={() =>
                            activeStep === 3
                                ? setIsCreateModalOpen(false)
                                : setActiveStep((prev) => prev + 1)
                        }
                        sx={{
                            bgcolor: "var(--brand-primary)",
                            borderRadius: "12px",
                            px: 4,
                            fontWeight: 700,
                            boxShadow: "none",
                        }}
                    >
                        {activeStep === 3 ? "Send Invitation" : "Continue"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        minWidth: 160,
                    },
                }}
            >
                <MenuItem
                    sx={{ fontSize: "13px", fontWeight: 600, gap: 1.5 }}
                    onClick={() => setAnchorEl(null)}
                >
                    <Edit2 size={14} /> Edit Profile
                </MenuItem>
                <MenuItem
                    sx={{ fontSize: "13px", fontWeight: 600, gap: 1.5 }}
                    onClick={() => setAnchorEl(null)}
                >
                    <RefreshCcw size={14} /> Reset Password
                </MenuItem>
                <div className="my-1 border-t border-(--ui-divider)" />
                <MenuItem
                    sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        gap: 1.5,
                        color: "var(--text-rose)",
                    }}
                    onClick={() => setAnchorEl(null)}
                >
                    <UserX size={14} /> Suspend
                </MenuItem>
                <MenuItem
                    sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        gap: 1.5,
                        color: "var(--text-rose)",
                    }}
                    onClick={() => setAnchorEl(null)}
                >
                    <Trash2 size={14} /> Delete
                </MenuItem>
            </Menu>
        </div>
    );
};

export default UserManagement;
