import React, { useState, useMemo, useCallback } from "react";
import {
    IconButton, Avatar, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Stepper, Step, StepLabel, Tooltip, Menu, MenuItem,
    Checkbox, TablePagination, CircularProgress, Alert, Snackbar,
} from "@mui/material";
import {
    Users, UserPlus, Download, Search, MoreVertical, ChevronRight,
    ShieldCheck, Building2, Mail, Lock, Eye, Edit2, UserX, Trash2,
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

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
    admin: { color: "bg-purple-50 text-purple-600 border-purple-100", icon: ShieldCheck },
    principal: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: Building2 },
    hod: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Users },
    teacher: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Users },
    student: { color: "bg-slate-50 text-slate-600 border-slate-100", icon: Users },
};

const ROLES: UserRole[] = ["admin", "principal", "hod", "teacher", "student"];

const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Admin", principal: "Principal", hod: "HOD",
    teacher: "Teacher", student: "Student",
};

const WIZARD_STEPS = ["Identity", "Role & Institute", "Review"];

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = (): CreateUserPayload => ({
    firstName: "", lastName: "", email: "",
    password: "", role: "student", institute: "", department: "",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border w-fit ${cfg.color}`}>
            {ROLE_LABELS[role as UserRole] ?? role}
        </span>
    );
};

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
        {isActive ? "Active" : "Suspended"}
    </span>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserManagement: React.FC = () => {
    // ── Filters / pagination state ──
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [instFilter, setInstFilter] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // ── UI state ──
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

    // ── RTK Query hooks ──
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

    // ── Helpers ──
    const toast = useCallback((msg: string, severity: "success" | "error" = "success") => {
        setSnack({ msg, severity });
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    // ── Create wizard validation ──
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
            // Submit
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

    // ── Toggle suspend / activate ──
    const handleToggleStatus = async (user: User) => {
        try {
            await toggleStatus(user._id).unwrap();
            toast(`User ${user.isActive ? "suspended" : "activated"} successfully`);
            if (selectedUser?._id === user._id) setSelectedUser(null);
        } catch (err: any) {
            toast(err?.data?.message ?? "Failed to update status", "error");
        }
    };

    // ── Reset password ──
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

    // ── Delete ──
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

    // ── Inline field helper ──
    const field = (label: string, key: keyof CreateUserPayload, type = "text", placeholder = "") => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">{label}</label>
            <input
                type={type}
                value={form[key] as string}
                onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setFormErrors((p) => ({ ...p, [key]: undefined })); }}
                placeholder={placeholder}
                className={`w-full bg-(--bg-base) border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none ${formErrors[key] ? "border-rose-400" : "border-(--ui-border)"}`}
            />
            {formErrors[key] && <p className="text-[10px] text-rose-500 font-semibold">{formErrors[key]}</p>}
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex-grow bg-(--bg-base) min-h-screen">

            {/* ── Header ── */}
            <header className="h-20 bg-(--bg-surface) border-b border-(--ui-border) px-8 flex items-center justify-between sticky top-0 z-40">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-(--text-secondary) uppercase tracking-widest mb-1">
                        <span>Dashboard</span><ChevronRight size={10} /><span className="text-(--text-primary)">Users</span>
                    </div>
                    <h1 className="text-xl font-black text-(--text-primary)">User Management</h1>
                    <p className="text-[11px] text-(--text-secondary) font-medium">Manage all system users across institutes</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outlined" startIcon={<Download size={16} />}
                        sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "var(--ui-border)", color: "var(--text-primary)" }}>
                        Export
                    </Button>
                    <Button variant="contained" startIcon={<UserPlus size={16} />}
                        onClick={() => { setIsCreateOpen(true); setActiveStep(0); setForm(emptyForm()); setFormErrors({}); }}
                        sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: "var(--brand-primary)", boxShadow: "none" }}>
                        Create User
                    </Button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {KPI_STATS.map((kpi, i) => {
                        const cfg = kpi.role ? ROLE_CONFIG[kpi.role] : ROLE_CONFIG.student;
                        const Icon = cfg?.icon ?? Users;
                        return (
                            <div key={i} className="bg-(--bg-surface) p-5 rounded-2xl border border-(--ui-border) shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-xl ${cfg?.color ?? "bg-slate-50 text-slate-500"}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">{kpi.label}</p>
                                <h3 className="text-2xl font-black text-(--text-primary) mt-1">
                                    {isFetching ? "—" : kpi.count.toLocaleString()}
                                </h3>
                            </div>
                        );
                    })}
                </div>

                {/* ── Table Card ── */}
                <div className="bg-(--bg-surface) rounded-2xl border border-(--ui-border) shadow-sm overflow-hidden">

                    {/* Filters toolbar */}
                    <div className="p-6 border-b border-(--ui-divider)">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-grow max-w-md">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                                <input type="text" placeholder="Search by name or email…"
                                    className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-(--brand-primary)"
                                    value={searchTerm} onChange={handleSearchChange} />
                            </div>
                            <select title="role filter" value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                                className="bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm font-semibold outline-none">
                                <option value="">All Roles</option>
                                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                            </select>
                            <select title="institute filter" value={instFilter}
                                onChange={(e) => { setInstFilter(e.target.value); setPage(0); }}
                                className="bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-2.5 text-sm font-semibold outline-none">
                                <option value="">All Institutes</option>
                                {institutes.map((inst) => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                            </select>
                            <Button startIcon={<RefreshCcw size={16} />}
                                onClick={() => { setSearchTerm(""); setRoleFilter(""); setInstFilter(""); setPage(0); }}
                                sx={{ textTransform: "none", fontWeight: 700, color: "var(--text-secondary)" }}>
                                Reset
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isFetching ? (
                            <div className="flex justify-center items-center py-24">
                                <CircularProgress size={36} sx={{ color: "var(--brand-primary)" }} />
                            </div>
                        ) : isError ? (
                            <div className="p-8">
                                <Alert severity="error" icon={<AlertTriangle size={18} />}>Failed to load users. Please try again.</Alert>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3 text-(--text-secondary)">
                                <Users size={40} strokeWidth={1.2} />
                                <p className="text-sm font-bold">No users found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-(--bg-base)/50 border-b border-(--ui-divider)">
                                        <th className="px-6 py-4 w-10"><Checkbox size="small" /></th>
                                        <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">User Profile</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">Institute</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-(--text-secondary) uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-(--ui-divider)">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-(--bg-base)/30 transition-colors">
                                            <td className="px-6 py-4"><Checkbox size="small" /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar sx={{ width: 40, height: 40, bgcolor: "var(--bg-sidebar)", fontWeight: 800 }}>
                                                        {user.firstName.charAt(0)}
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-(--text-primary)">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-(--text-secondary) font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <RoleBadge role={user.role} />
                                                    <p className="text-[10px] text-(--text-secondary) font-medium">
                                                        {user.lastLogin ? `Last: ${new Date(user.lastLogin).toLocaleDateString()}` : "Never logged in"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-bold text-(--text-primary)">
                                                    {typeof user.institute === "object" && user.institute ? user.institute.name : "—"}
                                                </p>
                                                {typeof user.department === "object" && user.department && (
                                                    <p className="text-[10px] text-(--text-secondary) font-semibold uppercase">{user.department.name}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge isActive={user.isActive} /></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
                                                            <Eye size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="More">
                                                        <IconButton size="small" onClick={(e) => setMenuAnchor({ el: e.currentTarget, user })}>
                                                            <MoreVertical size={18} />
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
                                fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-secondary)",
                            },
                        }}
                    />
                </div>
            </div>

            {/* ── Detail Drawer ── */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[520px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedUser ? "translate-x-0" : "translate-x-full"}`}>
                {selectedUser && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-(--ui-divider) flex items-center justify-between bg-(--bg-base)/30">
                            <h2 className="text-lg font-black text-(--text-primary)">User Dossier</h2>
                            <IconButton onClick={() => setSelectedUser(null)}><X size={20} /></IconButton>
                        </div>
                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            {/* Avatar */}
                            <div className="flex flex-col items-center text-center">
                                <Avatar sx={{ width: 80, height: 80, mb: 2, fontSize: "2rem", fontWeight: 900, bgcolor: "var(--brand-primary)" }}>
                                    {selectedUser.firstName.charAt(0)}
                                </Avatar>
                                <h3 className="text-xl font-black text-(--text-primary)">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                <div className="mt-1"><RoleBadge role={selectedUser.role} /></div>
                                <div className="mt-2"><StatusBadge isActive={selectedUser.isActive} /></div>
                            </div>

                            {/* Info cards */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-2xl border border-(--ui-divider) bg-(--bg-base)/20 flex items-center gap-4">
                                    <Mail size={18} className="text-(--text-secondary)" />
                                    <div>
                                        <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-tighter">Email</p>
                                        <p className="text-sm font-bold text-(--text-primary)">{selectedUser.email}</p>
                                    </div>
                                </div>
                                {typeof selectedUser.institute === "object" && selectedUser.institute && (
                                    <div className="p-4 rounded-2xl border border-(--ui-divider) bg-(--bg-base)/20 flex items-center gap-4">
                                        <Building2 size={18} className="text-(--text-secondary)" />
                                        <div>
                                            <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-tighter">Institute</p>
                                            <p className="text-sm font-bold text-(--text-primary)">{selectedUser.institute.name}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 rounded-2xl border border-(--ui-divider) bg-(--bg-base)/20 flex items-center gap-4">
                                    <Lock size={18} className="text-(--text-secondary)" />
                                    <div>
                                        <p className="text-[10px] font-black text-(--text-secondary) uppercase tracking-tighter">Last Login</p>
                                        <p className="text-sm font-bold text-(--text-primary)">
                                            {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3 pt-4">
                                <Button variant="contained" fullWidth startIcon={<RefreshCcw size={18} />}
                                    onClick={() => { setResetPwdOpen(true); setNewPassword(""); }}
                                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, bgcolor: "var(--brand-primary)", py: 1.5, boxShadow: "none" }}>
                                    Reset Password
                                </Button>
                                <Button variant="outlined" fullWidth
                                    startIcon={selectedUser.isActive ? <UserX size={18} /> : <CheckCircle2 size={18} />}
                                    color={selectedUser.isActive ? "error" : "success"}
                                    disabled={toggling}
                                    onClick={() => handleToggleStatus(selectedUser)}
                                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, py: 1.5 }}>
                                    {toggling ? "Processing…" : selectedUser.isActive ? "Suspend Account" : "Activate Account"}
                                </Button>
                                <Button variant="outlined" fullWidth startIcon={<Trash2 size={18} />} color="error"
                                    onClick={() => { setDeleteConfirm(selectedUser); setSelectedUser(null); }}
                                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, py: 1.5 }}>
                                    Delete User
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Context Menu ── */}
            <Menu anchorEl={menuAnchor?.el} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
                PaperProps={{ sx: { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", minWidth: 160 } }}>
                <MenuItem sx={{ fontSize: "13px", fontWeight: 600, gap: 1.5 }}
                    onClick={() => { setSelectedUser(menuAnchor!.user); setMenuAnchor(null); }}>
                    <Eye size={14} /> View Details
                </MenuItem>
                <MenuItem sx={{ fontSize: "13px", fontWeight: 600, gap: 1.5 }}
                    onClick={() => { if (menuAnchor) handleToggleStatus(menuAnchor.user); setMenuAnchor(null); }}>
                    {menuAnchor?.user.isActive ? <UserX size={14} /> : <CheckCircle2 size={14} />}
                    {menuAnchor?.user.isActive ? "Suspend" : "Activate"}
                </MenuItem>
                <div className="my-1 border-t border-(--ui-divider)" />
                <MenuItem sx={{ fontSize: "13px", fontWeight: 600, gap: 1.5, color: "var(--text-rose)" }}
                    onClick={() => { setDeleteConfirm(menuAnchor!.user); setMenuAnchor(null); }}>
                    <Trash2 size={14} /> Delete
                </MenuItem>
            </Menu>

            {/* ── Create User Wizard ── */}
            <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "24px" } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>Provision New User</DialogTitle>
                <DialogContent sx={{ px: 4 }}>
                    <Stepper activeStep={activeStep} sx={{ my: 4 }}>
                        {WIZARD_STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel sx={{ "& .MuiStepLabel-label": { fontSize: "9px", fontWeight: 900, textTransform: "uppercase" } }}>
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <div className="py-4 min-h-[300px]">
                        {/* Step 0 – Identity */}
                        {activeStep === 0 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    {field("First Name", "firstName", "text", "John")}
                                    {field("Last Name", "lastName", "text", "Doe")}
                                </div>
                                {field("Email Address", "email", "email", "john@institute.edu")}
                                {field("Password", "password", "password", "Min 6 characters")}
                                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
                                    <Lock size={18} className="text-blue-500 shrink-0" />
                                    <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
                                        The user can change their password after first login.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 1 – Role & Institute */}
                        {activeStep === 1 && (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">System Role</label>
                                    <select value={form.role} title="select role"
                                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-(--brand-primary)">
                                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">Primary Institute <span className="normal-case text-[10px] text-(--text-secondary)">(optional)</span></label>
                                    <select value={form.institute ?? ""} title="select institute"
                                        onChange={(e) => setForm((p) => ({ ...p, institute: e.target.value }))}
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-(--brand-primary)">
                                        <option value="">None</option>
                                        {institutes.map((inst) => <option key={inst._id} value={inst._id}>{inst.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Step 2 – Review */}
                        {activeStep === 2 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-(--text-primary)">Review Details</h4>
                                {[
                                    ["Name", `${form.firstName} ${form.lastName}`],
                                    ["Email", form.email],
                                    ["Role", ROLE_LABELS[form.role]],
                                    ["Institute", institutes.find((i) => i._id === form.institute)?.name ?? "None"],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between py-2.5 border-b border-(--ui-divider)">
                                        <span className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">{k}</span>
                                        <span className="text-sm font-bold text-(--text-primary)">{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setIsCreateOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <div className="flex-grow" />
                    {activeStep > 0 && (
                        <Button onClick={() => setActiveStep((p) => p - 1)} sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Back</Button>
                    )}
                    <Button variant="contained" disabled={creating} onClick={handleWizardNext}
                        sx={{ bgcolor: "var(--brand-primary)", borderRadius: "12px", px: 4, fontWeight: 700, boxShadow: "none" }}>
                        {creating ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : activeStep === WIZARD_STEPS.length - 1 ? "Create User" : "Continue"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Reset Password Dialog ── */}
            <Dialog open={resetPwdOpen} onClose={() => setResetPwdOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>Reset Password</DialogTitle>
                <DialogContent sx={{ px: 4, pb: 2 }}>
                    <p className="text-sm text-(--text-secondary) mb-4">Set a new password for <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong></p>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none" />
                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="text-[10px] text-rose-500 font-semibold">Password must be at least 6 characters</p>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setResetPwdOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" disabled={newPassword.length < 6 || resettingPwd} onClick={handleResetPassword}
                        sx={{ bgcolor: "var(--brand-primary)", borderRadius: "12px", fontWeight: 700, boxShadow: "none" }}>
                        {resettingPwd ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Reset"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Delete Confirm Dialog ── */}
            <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>Delete User</DialogTitle>
                <DialogContent sx={{ px: 4, pb: 2 }}>
                    <p className="text-sm text-(--text-secondary)">
                        Are you sure you want to permanently delete <strong>{deleteConfirm?.firstName} {deleteConfirm?.lastName}</strong>? This action cannot be undone.
                    </p>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setDeleteConfirm(null)} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" color="error" disabled={deleting} onClick={handleDelete}
                        sx={{ borderRadius: "12px", fontWeight: 700, boxShadow: "none" }}>
                        {deleting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Toast ── */}
            <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack?.severity ?? "success"} onClose={() => setSnack(null)} sx={{ borderRadius: "12px", fontWeight: 700 }}>
                    {snack?.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserManagement;
