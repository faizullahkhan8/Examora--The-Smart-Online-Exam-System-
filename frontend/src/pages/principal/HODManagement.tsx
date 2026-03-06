import { useState, useDeferredValue } from "react";
import {
    Button,
    IconButton,
    Chip,
    Drawer,
    TextField,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    TablePagination,
} from "@mui/material";
import {
    Plus,
    Search,
    Users,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Mail,
} from "lucide-react";
import {
    useGetAllUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useToggleUserStatusMutation,
    useDeleteUserMutation,
    type User,
} from "../../services/user/user.service";

const textFieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
        fontSize: "14px",
        fontWeight: 500,
        "& fieldset": { borderColor: "var(--ui-border)" },
        "&:hover fieldset": { borderColor: "var(--brand-primary)" },
        "&.Mui-focused fieldset": { borderColor: "var(--brand-primary)" },
    },
    "& .MuiInputLabel-root": { color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-primary)" },
};

const buttonSx = {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 600,
};

const HODDrawer = ({
    open,
    editing,
    onClose,
}: {
    open: boolean;
    editing?: User | null;
    onClose: () => void;
}) => {
    const [form, setForm] = useState({
        firstName: editing?.firstName ?? "",
        lastName: editing?.lastName ?? "",
        email: editing?.email ?? "",
        password: "",
    });

    const [createUser, { isLoading: creating }] = useCreateUserMutation();
    const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

    const isLoading = creating || updating;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                const payload: any = { firstName: form.firstName, lastName: form.lastName, email: form.email };
                if (form.password) payload.password = form.password;
                await updateUser({ id: editing._id, data: payload }).unwrap();
            } else {
                await createUser({ ...form, role: "hod" }).unwrap();
            }
            onClose();
        } catch (_) { }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{ sx: { width: 400, p: 4, bgcolor: "var(--bg-surface)", borderLeft: "1px solid var(--ui-border)" } }}>
            <h2 className="text-xl font-black text-(--text-primary) tracking-tight mb-1">
                {editing ? "Update HOD Profile" : "Provision New HOD"}
            </h2>
            <p className="text-xs text-(--text-secondary) font-medium mb-6">
                {editing ? "Modify user details and credentials." : "Create a new Head of Department account."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                    <TextField fullWidth label="First Name" required
                        value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                        sx={textFieldSx} />
                    <TextField fullWidth label="Last Name" required
                        value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                        sx={textFieldSx} />
                </div>
                <TextField fullWidth label="Email Address" type="email" required
                    value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    sx={textFieldSx} />
                <TextField fullWidth label={editing ? "New Password (Optional)" : "Temporary Password"} type="password" required={!editing}
                    value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    sx={textFieldSx} />

                <div className="flex gap-3 pt-4 border-t border-(--ui-divider) mt-2">
                    <Button fullWidth variant="outlined" onClick={onClose}
                        sx={{ ...buttonSx, borderColor: "var(--ui-border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                        Cancel
                    </Button>
                    <Button fullWidth type="submit" variant="contained" disabled={isLoading}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {isLoading ? "Saving…" : editing ? "Update Account" : "Create Account"}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

const DeleteDialog = ({
    open,
    user,
    onClose,
    onConfirm,
    isDeleting,
}: {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}) => {
    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)", bgcolor: "var(--bg-surface)", minWidth: 400, boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}>
            <DialogTitle sx={{ fontWeight: 800, color: "var(--text-primary)", px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>
                Confirm Account Deletion
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 1 }}>
                <p className="text-sm text-(--text-secondary) font-medium">
                    Are you sure you want to permanently delete the account for <strong className="text-(--text-primary)">{user?.firstName} {user?.lastName}</strong>? This action will remove their access to the system.
                </p>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button onClick={onClose} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                <Button onClick={onConfirm} disabled={isDeleting} color="error"
                    variant="contained" sx={{ ...buttonSx, boxShadow: "none" }}>
                    {isDeleting ? "Deleting…" : "Permanently Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const HODManagement = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const deferredSearch = useDeferredValue(search);

    const { data, isLoading } = useGetAllUsersQuery({
        role: "hod",
        search: deferredSearch || undefined,
        page: page + 1,
        limit: rowsPerPage,
    });
    const hods = data?.data ?? [];
    const pagination = data?.pagination;

    const [toggleStatus] = useToggleUserStatusMutation();
    const [deleteUserMutation, { isLoading: isDeleting }] = useDeleteUserMutation();

    const handleDelete = async () => {
        if (!deleteUser) return;
        try {
            await deleteUserMutation(deleteUser._id).unwrap();
            setDeleteUser(null);
        } catch (_) { }
    };

    return (
        <div className="w-full bg-(--bg-base) min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            HOD Management
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Provision Head of Department accounts and monitor system access.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                            <input
                                placeholder="Search personnel…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                className="bg-(--bg-base) border border-(--ui-border) rounded-lg pl-9 pr-4 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none w-64 transition-all text-(--text-primary)"
                            />
                        </div>
                        <Button variant="contained" startIcon={<Plus size={16} />}
                            onClick={() => { setEditingUser(null); setDrawerOpen(true); }}
                            sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", px: 3, "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                            Provision HOD
                        </Button>
                    </div>
                </div>

                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[420px]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-(--ui-divider) bg-(--bg-base) text-left">
                                    {["Personnel Profile", "Contact Email", "Account Status", "System Actions"].map((h, i) => (
                                        <th key={h} className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-(--text-secondary) ${i === 3 ? "text-right" : ""}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="hover:bg-(--bg-base) transition-colors">
                                            {Array.from({ length: 4 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <Skeleton height={20} sx={{ bgcolor: "var(--ui-divider)", borderRadius: "4px" }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : hods.map((user) => (
                                        <tr key={user._id} className="hover:bg-(--bg-base) transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar sx={{ width: 40, height: 40, bgcolor: "var(--bg-sidebar)", color: "var(--text-on-dark)", fontSize: "14px", fontWeight: 700, borderRadius: "10px" }}>
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-sm text-(--text-primary)">{user.firstName} {user.lastName}</p>
                                                        <p className="text-[11px] text-(--text-secondary) font-bold uppercase tracking-wider mt-0.5">Head of Department</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-medium text-(--text-secondary)">
                                                    <Mail size={14} className="opacity-70" />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Chip
                                                    label={user.isActive ? "Active" : "Suspended"}
                                                    size="small"
                                                    className={`text-[10px]! font-bold! uppercase! tracking-wider! h-5! px-1.5! border ${user.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-(--bg-base) text-(--text-secondary) border-(--ui-border)"}`}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <IconButton size="small" title="Edit Profile"
                                                        onClick={() => { setEditingUser(user); setDrawerOpen(true); }}
                                                        sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}>
                                                        <Pencil size={16} />
                                                    </IconButton>
                                                    <IconButton size="small" title={user.isActive ? "Suspend Account" : "Activate Account"}
                                                        onClick={() => toggleStatus(user._id)}
                                                        sx={{ color: "var(--text-secondary)", "&:hover": { bgcolor: "var(--bg-base)" } }}>
                                                        {user.isActive
                                                            ? <ToggleRight size={16} className="text-emerald-500" />
                                                            : <ToggleLeft size={16} />
                                                        }
                                                    </IconButton>
                                                    <IconButton size="small" title="Delete Account"
                                                        onClick={() => setDeleteUser(user)}
                                                        sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--status-danger)", bgcolor: "var(--bg-base)" } }}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {!isLoading && hods.length === 0 && (
                            <div className="text-center py-20 bg-(--bg-base)">
                                <Users size={48} className="mx-auto text-(--text-secondary) opacity-30 mb-4" />
                                <p className="font-black text-(--text-primary) text-lg">No HOD accounts found</p>
                                <p className="text-sm font-medium text-(--text-secondary) mt-1">Click "Provision HOD" to onboard your first department head.</p>
                            </div>
                        )}
                    </div>
                    <TablePagination
                        component="div"
                        count={pagination?.total ?? hods.length}
                        page={page}
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

            <HODDrawer
                open={drawerOpen}
                editing={editingUser}
                onClose={() => { setDrawerOpen(false); setEditingUser(null); }}
            />
            <DeleteDialog
                open={!!deleteUser}
                user={deleteUser}
                onClose={() => setDeleteUser(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default HODManagement;