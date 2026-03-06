import React, { useState, useMemo, useCallback } from "react";
import {
    IconButton, Avatar, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Stepper, Step, StepLabel, Tooltip, Menu, MenuItem,
    Checkbox, TablePagination, CircularProgress, Alert, Snackbar,
} from "@mui/material";
import {
    Users, UserPlus, Download, Search, MoreVertical, ChevronRight,
    ShieldCheck, Building2, Mail, Lock, Eye, UserX, Trash2,
    X, CheckCircle2, RefreshCcw, AlertTriangle,
} from "lucide-react";

import {
    useGetAllUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserStatusMutation,
    useAdminResetPasswordMutation,
    type User,
    type CreateUserPayload,
    type UserRole,
} from "../../services/user/user.service";
import { useGetAllInstitutesQuery } from "../../services/institute/institute.service";

const ROLE_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
    admin: { color: "bg-purple-50 text-purple-600 border-purple-100", icon: ShieldCheck },
    principal: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: Building2 },
    hod: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Users },
    teacher: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Users },
    student: { color: "bg-[var(--bg-base)] text-slate-600 border-slate-200", icon: Users },
};

const ROLES: UserRole[] = ["admin", "principal", "hod", "teacher", "student"];

const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Admin", principal: "Principal", hod: "HOD",
    teacher: "Teacher", student: "Student",
};

const WIZARD_STEPS = ["Identity", "Role & Institute", "Review"];

const emptyForm = (): CreateUserPayload => ({
    firstName: "", lastName: "", email: "",
    password: "", role: "student", institute: "", department: "",
});

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold border w-fit ${cfg.color}`}>
            {ROLE_LABELS[role as UserRole] ?? role}
        </span>
    );
};

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
        {isActive ? "Active" : "Suspended"}
    </span>
);

const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [instFilter, setInstFilter] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; user: User } | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [form, setForm] = useState<CreateUserPayload>(emptyForm());
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateUserPayload, string>>>({});
    const [resetPwdOpen, setResetPwdOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
    const [snack, setSnack] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

    const queryParams = useMemo(() => ({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        institute: instFilter || undefined,
        page: page + 1,
        limit: rowsPerPage,
    }), [searchTerm, roleFilter, instFilter, page, rowsPerPage]);

    const { data, isFetching, isError } = useGetAllUsersQuery(queryParams);
    const { data: institutesData } = useGetAllInstitutesQuery();

    const [createUser, { isLoading: creating }] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();
    const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
    const [toggleStatus, { isLoading: toggling }] = useToggleUserStatusMutation();
    const [resetPassword, { isLoading: resettingPwd }] = useAdminResetPasswordMutation();

    const users = data?.data ?? [];
    const stats = data?.stats ?? {};
    const pagination = data?.pagination;
    const institutes = institutesData?.data ?? [];

    const totalUsers = Object.values(stats).reduce((a, b) => a + b, 0);

    const KPI_STATS = [
        { label: "Total Users", count: totalUsers, role: "" },
        { label: "Admins", count: stats.admin ?? 0, role: "admin" },
        { label: "Teachers", count: stats.teacher ?? 0, role: "teacher" },
        { label: "Students", count: stats.student ?? 0, role: "student" },
    ];

    const toast = useCallback((msg: string, severity: "success" | "error" = "success") => {
        setSnack({ msg, severity });
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const validateStep = (): boolean => {
        const errors: typeof formErrors = {};
        if (activeStep === 0) {
            if (!form.firstName.trim()) errors.firstName = "Required";
            if (!form.lastName.trim()) errors.lastName = "Required";
            if (!form.email.trim()) errors.email = "Required";
            else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email";
            if (form.password.length < 6) errors.password = "Min 6 characters";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleWizardNext = async () => {
        if (!validateStep()) return;
        if (activeStep < WIZARD_STEPS.length - 1) {
            setActiveStep((p) => p + 1);
        } else {
            try {
                const payload: CreateUserPayload = {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    ...(form.institute ? { institute: form.institute } : {}),
                    ...(form.department ? { department: form.department } : {}),
                };
                await createUser(payload).unwrap();
                toast("User created successfully");
                setIsCreateOpen(false);
                setForm(emptyForm());
                setActiveStep(0);
            } catch (err: any) {
                toast(err?.data?.message ?? "Failed to create user", "error");
            }
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await toggleStatus(user._id).unwrap();
            toast(`User ${user.isActive ? "suspended" : "activated"} successfully`);
            if (selectedUser?._id === user._id) setSelectedUser(null);
        } catch (err: any) {
            toast(err?.data?.message ?? "Failed to update status", "error");
        }
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 6) return;
        try {
            await resetPassword({ id: selectedUser!._id, data: { newPassword } }).unwrap();
            toast("Password reset successfully");
            setResetPwdOpen(false);
            setNewPassword("");
        } catch (err: any) {
            toast(err?.data?.message ?? "Failed to reset password", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await deleteUser(deleteConfirm._id).unwrap();
            toast("User deleted successfully");
            setDeleteConfirm(null);
            if (selectedUser?._id === deleteConfirm._id) setSelectedUser(null);
        } catch (err: any) {
            toast(err?.data?.message ?? "Failed to delete user", "error");
        }
    };

    const field = (label: string, key: keyof CreateUserPayload, type = "text", placeholder = "") => (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-(--text-secondary)">{label}</label>
            <input
                type={type}
                value={form[key] as string}
                onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setFormErrors((p) => ({ ...p, [key]: undefined })); }}
                placeholder={placeholder}
                className={`w-full bg-[var(--bg-base)] border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none transition-colors ${formErrors[key] ? "border-rose-400 focus:border-rose-400" : "border-(--ui-border) focus:border-(--brand-primary)"}`}
            />
            {formErrors[key] && <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors[key]}</p>}
        </div>
    );

    const buttonSx = {
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
    };

    return (
        <div className="w-full bg-[var(--bg-base)] min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            User Management
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Manage all system users across institutes.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outlined" startIcon={<Download size={16} />}
                            sx={{ ...buttonSx, borderColor: "var(--ui-border)", color: "var(--text-primary)", "&:hover": { borderColor: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}>
                            Export
                        </Button>
                        <Button variant="contained" startIcon={<UserPlus size={16} />}
                            onClick={() => { setIsCreateOpen(true); setActiveStep(0); setForm(emptyForm()); setFormErrors({}); }}
                            sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                            Create User
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {KPI_STATS.map((kpi, i) => {
                        const cfg = kpi.role ? ROLE_CONFIG[kpi.role] : ROLE_CONFIG.student;
                        const Icon = cfg?.icon ?? Users;
                        return (
                            <div key={i} className="p-5 bg-(--bg-surface) border border-(--ui-border) rounded-xl hover:border-(--brand-primary) transition-colors shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2.5 rounded-lg bg-[var(--bg-base)]">
                                        <Icon size={20} className="text-(--brand-primary)" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-(--text-primary) tracking-tight">
                                    {isFetching ? "..." : kpi.count.toLocaleString()}
                                </h3>
                                <p className="text-xs font-semibold text-(--text-secondary) mt-1">
                                    {kpi.label}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-(--ui-divider)">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                                <input type="text" placeholder="Search by name or email..."
                                    className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg pl-9 pr-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) transition-all"
                                    value={searchTerm} onChange={handleSearchChange} />
                            </div>
                            <select title="role filter" value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                                className="bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary)">
                                <option value="">All Roles</option>
                                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                            </select>
                            <select title="institute filter" value={instFilter}
                                onChange={(e) => { setInstFilter(e.target.value); setPage(0); }}
                                className="bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary)">
                                <option value="">All Institutes</option>
                                {institutes.map((inst) => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                            </select>
                            <Button startIcon={<RefreshCcw size={16} />}
                                onClick={() => { setSearchTerm(""); setRoleFilter(""); setInstFilter(""); setPage(0); }}
                                sx={{ textTransform: "none", fontWeight: 600, color: "var(--text-secondary)" }}>
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isFetching ? (
                            <div className="flex justify-center items-center py-20">
                                <CircularProgress size={32} sx={{ color: "var(--brand-primary)" }} />
                            </div>
                        ) : isError ? (
                            <div className="p-6">
                                <Alert severity="error" icon={<AlertTriangle size={18} />} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                                    Failed to load users. Please try again.
                                </Alert>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-(--text-secondary) opacity-60">
                                <Users size={32} />
                                <p className="text-sm font-semibold">No users found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--bg-base)] border-b border-(--ui-divider)">
                                        <th className="px-5 py-3 w-10"><Checkbox size="small" sx={{ p: 0 }} /></th>
                                        <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">User Profile</th>
                                        <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Role</th>
                                        <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Institute</th>
                                        <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--ui-divider)">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-[var(--bg-base)] transition-colors">
                                            <td className="px-5 py-3"><Checkbox size="small" sx={{ p: 0 }} /></td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar sx={{ width: 36, height: 36, bgcolor: "var(--bg-sidebar)", fontSize: "14px", fontWeight: 700 }}>
                                                        {user.firstName.charAt(0)}
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-(--text-primary)">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs font-medium text-(--text-secondary)">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <RoleBadge role={user.role} />
                                                    <p className="text-[10px] text-(--text-secondary) font-medium">
                                                        {user.lastLogin ? `Last: ${new Date(user.lastLogin).toLocaleDateString()}` : "Never logged in"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-bold text-(--text-primary)">
                                                    {typeof user.institute === "object" && user.institute ? user.institute.name : "—"}
                                                </p>
                                                {typeof user.department === "object" && user.department && (
                                                    <p className="text-xs text-(--text-secondary) font-medium">{user.department.name}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3"><StatusBadge isActive={user.isActive} /></td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
                                                            <Eye size={16} className="text-(--text-secondary)" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="More">
                                                        <IconButton size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, user })}>
                                                            <MoreVertical size={16} className="text-(--text-secondary)" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <TablePagination component="div"
                        count={pagination?.total ?? 0} page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{
                            borderTop: "1px solid var(--ui-divider)",
                            ".MuiTablePagination-selectLabel,.MuiTablePagination-displayedRows": {
                                fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)",
                            },
                        }}
                    />
                </div>
            </div>

            <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedUser ? "translate-x-0" : "translate-x-full"}`}>
                {selectedUser && (
                    <div className="h-full flex flex-col">
                        <div className="p-5 border-b border-(--ui-divider) flex items-center justify-between bg-[var(--bg-base)]">
                            <h2 className="text-base font-bold text-(--text-primary)">User Profile</h2>
                            <IconButton onClick={() => setSelectedUser(null)} size="small"><X size={18} /></IconButton>
                        </div>
                        <div className="flex-grow overflow-y-auto p-6 space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar sx={{ width: 72, height: 72, mb: 2, fontSize: "1.75rem", fontWeight: 800, bgcolor: "var(--brand-primary)" }}>
                                    {selectedUser.firstName.charAt(0)}
                                </Avatar>
                                <h3 className="text-xl font-bold text-(--text-primary)">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                <div className="mt-2"><RoleBadge role={selectedUser.role} /></div>
                                <div className="mt-2"><StatusBadge isActive={selectedUser.isActive} /></div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-4 rounded-xl border border-(--ui-border) bg-[var(--bg-base)] flex items-center gap-4">
                                    <Mail size={16} className="text-(--text-secondary)" />
                                    <div>
                                        <p className="text-xs font-semibold text-(--text-secondary)">Email Address</p>
                                        <p className="text-sm font-bold text-(--text-primary)">{selectedUser.email}</p>
                                    </div>
                                </div>
                                {typeof selectedUser.institute === "object" && selectedUser.institute && (
                                    <div className="p-4 rounded-xl border border-(--ui-border) bg-[var(--bg-base)] flex items-center gap-4">
                                        <Building2 size={16} className="text-(--text-secondary)" />
                                        <div>
                                            <p className="text-xs font-semibold text-(--text-secondary)">Associated Institute</p>
                                            <p className="text-sm font-bold text-(--text-primary)">{selectedUser.institute.name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 rounded-xl border border-(--ui-border) bg-[var(--bg-base)] flex items-center gap-4">
                                    <Lock size={16} className="text-(--text-secondary)" />
                                    <div>
                                        <p className="text-xs font-semibold text-(--text-secondary)">Last Known Login</p>
                                        <p className="text-sm font-bold text-(--text-primary)">
                                            {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never logged in"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button variant="contained" fullWidth startIcon={<RefreshCcw size={16} />}
                                    onClick={() => { setResetPwdOpen(true); setNewPassword(""); }}
                                    sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", py: 1.25, boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                                    Reset User Password
                                </Button>
                                <Button variant="outlined" fullWidth
                                    startIcon={selectedUser.isActive ? <UserX size={16} /> : <CheckCircle2 size={16} />}
                                    color={selectedUser.isActive ? "error" : "success"}
                                    disabled={toggling}
                                    onClick={() => handleToggleStatus(selectedUser)}
                                    sx={{ ...buttonSx, py: 1.25 }}>
                                    {toggling ? "Processing..." : selectedUser.isActive ? "Suspend Account" : "Activate Account"}
                                </Button>
                                <Button variant="outlined" fullWidth startIcon={<Trash2 size={16} />} color="error"
                                    onClick={() => { setDeleteConfirm(selectedUser); setSelectedUser(null); }}
                                    sx={{ ...buttonSx, py: 1.25 }}>
                                    Permanently Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { borderRadius: "8px", border: "1px solid var(--ui-border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", minWidth: 160 } }}>
                <MenuItem sx={{ fontSize: "13px", fontWeight: 500, gap: 1.5 }}
                    onClick={() => { setSelectedUser(menuAnchor!.user); setMenuAnchor(null); }}>
                    <Eye size={14} className="text-(--text-secondary)" /> View Profile
                </MenuItem>
                <MenuItem sx={{ fontSize: "13px", fontWeight: 500, gap: 1.5 }}
                    onClick={() => { if (menuAnchor) handleToggleStatus(menuAnchor.user); setMenuAnchor(null); }}>
                    {menuAnchor?.user.isActive ? <UserX size={14} className="text-(--text-secondary)" /> : <CheckCircle2 size={14} className="text-(--text-secondary)" />}
                    {menuAnchor?.user.isActive ? "Suspend" : "Activate"}
                </MenuItem>
                <div className="my-1 border-t border-(--ui-divider)" />
                <MenuItem sx={{ fontSize: "13px", fontWeight: 500, gap: 1.5, color: "var(--status-danger)" }}
                    onClick={() => { setDeleteConfirm(menuAnchor!.user); setMenuAnchor(null); }}>
                    <Trash2 size={14} /> Delete
                </MenuItem>
            </Menu>

            <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Provision New User</DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Stepper activeStep={activeStep} sx={{ my: 3 }}>
                        {WIZARD_STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" } }}>
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <div className="py-2 min-h-[260px]">
                        {activeStep === 0 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {field("First Name", "firstName", "text", "e.g. John")}
                                    {field("Last Name", "lastName", "text", "e.g. Doe")}
                                </div>
                                {field("Email Address", "email", "email", "john.doe@institute.edu")}
                                {field("Temporary Password", "password", "password", "Minimum 6 characters")}
                                <div className="p-3 rounded-lg bg-blue-50 flex gap-3 border border-blue-100 mt-2">
                                    <Lock size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-blue-700">
                                        The user will be able to change their password after logging in for the first time.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text-secondary)">System Role</label>
                                    <select value={form.role} title="select role"
                                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                                        className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary)">
                                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-(--text-secondary)">Primary Institute (Optional)</label>
                                    <select value={form.institute ?? ""} title="select institute"
                                        onChange={(e) => setForm((p) => ({ ...p, institute: e.target.value }))}
                                        className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary)">
                                        <option value="">None</option>
                                        {institutes.map((inst) => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-(--text-primary) mb-2">Review Information</h4>
                                <div className="bg-[var(--bg-base)] border border-(--ui-border) rounded-lg p-1">
                                    {[
                                        ["Full Name", `${form.firstName} ${form.lastName}`],
                                        ["Email Address", form.email],
                                        ["Assigned Role", ROLE_LABELS[form.role]],
                                        ["Institute", institutes.find((i) => i._id === form.institute)?.name ?? "Not assigned"],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between py-2.5 px-3 border-b border-(--ui-divider) last:border-0">
                                            <span className="text-xs font-semibold text-(--text-secondary)">{k}</span>
                                            <span className="text-sm font-bold text-(--text-primary)">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsCreateOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <div className="flex-grow" />
                    {activeStep > 0 && (
                        <Button onClick={() => setActiveStep((p) => p - 1)} sx={{ fontWeight: 600, color: "var(--text-primary)", textTransform: "none" }}>Back</Button>
                    )}
                    <Button variant="contained" disabled={creating} onClick={handleWizardNext}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", px: 3, boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {creating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : activeStep === WIZARD_STEPS.length - 1 ? "Create Account" : "Continue"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={resetPwdOpen} onClose={() => setResetPwdOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Reset Password</DialogTitle>
                <DialogContent sx={{ px: 3, pb: 1 }}>
                    <p className="text-sm text-(--text-secondary) mb-4 font-medium">Define a new password for <strong className="text-(--text-primary)">{selectedUser?.firstName} {selectedUser?.lastName}</strong>.</p>
                    <div className="space-y-1.5 pt-1">
                        <label className="text-xs font-semibold text-(--text-secondary)">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full bg-[var(--bg-base)] border border-(--ui-border) rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-colors" />
                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="text-[10px] text-rose-500 font-semibold mt-1">Password must be at least 6 characters</p>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setResetPwdOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" disabled={newPassword.length < 6 || resettingPwd} onClick={handleResetPassword}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {resettingPwd ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Apply Reset"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Confirm User Deletion</DialogTitle>
                <DialogContent sx={{ px: 3, pb: 1 }}>
                    <p className="text-sm text-(--text-secondary) font-medium">
                        Are you certain you wish to permanently delete <strong className="text-(--text-primary)">{deleteConfirm?.firstName} {deleteConfirm?.lastName}</strong>? This operation cannot be reversed.
                    </p>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setDeleteConfirm(null)} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" color="error" disabled={deleting} onClick={handleDelete}
                        sx={{ ...buttonSx, boxShadow: "none" }}>
                        {deleting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Delete Account"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack?.severity ?? "success"} onClose={() => setSnack(null)} sx={{ borderRadius: "8px", fontWeight: 600 }}>
                    {snack?.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserManagement;