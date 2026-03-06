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
    TablePagination,
} from "@mui/material";
import {
    Plus,
    Search,
    BookOpen,
    Pencil,
    Trash2,
    UserCheck,
    UserX,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import {
    useGetDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useToggleDepartmentStatusMutation,
    useAssignHODMutation,
    useRemoveHODMutation,
    useDeleteDepartmentMutation,
    type Department,
} from "../../services/department/department.service";
import { useGetAllUsersQuery } from "../../services/user/user.service";

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

const DeptDrawer = ({
    open,
    editing,
    onClose,
}: {
    open: boolean;
    editing?: Department | null;
    onClose: () => void;
}) => {
    const [form, setForm] = useState({ name: editing?.name ?? "", code: editing?.code ?? "", description: editing?.description ?? "", capacity: editing?.capacity ?? 0 });
    const [createDept, { isLoading: creating }] = useCreateDepartmentMutation();
    const [updateDept, { isLoading: updating }] = useUpdateDepartmentMutation();

    const isLoading = creating || updating;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateDept({ id: editing._id, data: form }).unwrap();
            } else {
                await createDept(form).unwrap();
            }
            onClose();
        } catch (_) { }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{ sx: { width: 400, p: 4, bgcolor: "var(--bg-surface)", borderLeft: "1px solid var(--ui-border)" } }}>
            <h2 className="text-xl font-black text-(--text-primary) tracking-tight mb-1">
                {editing ? "Edit Department" : "New Department"}
            </h2>
            <p className="text-xs text-(--text-secondary) font-medium mb-6">
                {editing ? "Update department information and capacity." : "Add a new academic department to your institute."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <TextField fullWidth label="Department Name" required
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    sx={textFieldSx} />
                <TextField fullWidth label="Department Code (e.g. CS)" required
                    value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    sx={textFieldSx} />
                <TextField fullWidth label="Description" multiline rows={3}
                    value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    sx={textFieldSx} />
                <TextField fullWidth label="Student Capacity" type="number"
                    value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                    sx={textFieldSx} />

                <div className="flex gap-3 pt-4 border-t border-(--ui-divider) mt-2">
                    <Button fullWidth variant="outlined" onClick={onClose}
                        sx={{ ...buttonSx, borderColor: "var(--ui-border)", color: "var(--text-secondary)", "&:hover": { borderColor: "var(--text-primary)", bgcolor: "var(--bg-base)" } }}>
                        Cancel
                    </Button>
                    <Button fullWidth type="submit" variant="contained" disabled={isLoading}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {isLoading ? "Saving…" : editing ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

const AssignHODDialog = ({
    open,
    dept,
    onClose,
}: {
    open: boolean;
    dept: Department | null;
    onClose: () => void;
}) => {
    const [selected, setSelected] = useState("");
    const { data: usersData } = useGetAllUsersQuery({ role: "hod" });
    const [assignHOD, { isLoading }] = useAssignHODMutation();

    const hodUsers = usersData?.data ?? [];

    const handleAssign = async () => {
        if (!dept || !selected) return;
        try {
            await assignHOD({ id: dept._id, hodId: selected }).unwrap();
            onClose();
        } catch (_) { }
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)", bgcolor: "var(--bg-surface)", minWidth: 400, boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}>
            <DialogTitle sx={{ fontWeight: 800, color: "var(--text-primary)", px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>
                Assign HOD — {dept?.name}
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
                <p className="text-sm text-(--text-secondary) font-medium mb-4">
                    Select an unassigned user with the HOD role to manage this department.
                </p>
                <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                    {hodUsers.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-(--ui-border) rounded-xl bg-(--bg-base)">
                            <p className="text-sm font-semibold text-(--text-secondary)">No HOD-role users found.</p>
                            <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider mt-1">Provision users in admin panel</p>
                        </div>
                    ) : (
                        hodUsers.map((u: any) => (
                            <button key={u._id}
                                onClick={() => setSelected(u._id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${selected === u._id
                                    ? "border-(--brand-primary) bg-(--brand-primary) bg-opacity-10"
                                    : "border-(--ui-border) bg-(--bg-base) hover:border-(--brand-primary)"
                                    }`}
                            >
                                <p className={`font-bold text-sm ${selected === u._id ? "text-(--brand-primary)" : "text-(--text-primary)"}`}>{u.firstName} {u.lastName}</p>
                                <p className={`text-xs font-medium mt-0.5 ${selected === u._id ? "text-(--brand-primary) opacity-80" : "text-(--text-secondary)"}`}>{u.email}</p>
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button onClick={onClose} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                <Button onClick={handleAssign} disabled={!selected || isLoading}
                    variant="contained" sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                    {isLoading ? "Assigning…" : "Assign HOD"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const Departments = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [assignDept, setAssignDept] = useState<Department | null>(null);

    const deferredSearch = useDeferredValue(search);
    const { data, isLoading } = useGetDepartmentsQuery({
        search: deferredSearch || undefined,
        page: page + 1,
        limit: rowsPerPage,
    });
    const departments = data?.data ?? [];
    const pagination = data?.pagination;

    const [toggleStatus] = useToggleDepartmentStatusMutation();
    const [removeHOD] = useRemoveHODMutation();
    const [deleteDept] = useDeleteDepartmentMutation();

    return (
        <div className="w-full bg-(--bg-base) min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            Departments
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Manage academic departments, student capacities, and faculty leadership.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                            <input
                                placeholder="Search departments…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                className="bg-(--bg-base) border border-(--ui-border) rounded-lg pl-9 pr-4 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none w-64 transition-all text-(--text-primary)"
                            />
                        </div>
                        <Button variant="contained" startIcon={<Plus size={16} />}
                            onClick={() => { setEditingDept(null); setDrawerOpen(true); }}
                            sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", px: 3, "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                            New Department
                        </Button>
                    </div>
                </div>

                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[420px]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-(--ui-divider) bg-(--bg-base) text-left">
                                    {["Department", "Code", "HOD", "Capacity", "Status", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-(--text-secondary)">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="hover:bg-(--bg-base) transition-colors">
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <Skeleton height={20} sx={{ bgcolor: "var(--ui-divider)", borderRadius: "4px" }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : departments.map((dept) => (
                                        <tr key={dept._id} className="hover:bg-(--bg-base) transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-(--brand-primary) bg-opacity-10 border border-(--brand-primary) border-opacity-20 rounded-xl flex items-center justify-center shrink-0">
                                                        <BookOpen size={18} className="text-(--brand-primary)" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-(--text-primary)">{dept.name}</p>
                                                        <p className="text-xs text-(--text-secondary) font-medium mt-0.5 max-w-[200px] truncate" title={dept.description}>{dept.description || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-[11px] bg-(--bg-base) border border-(--ui-border) text-(--text-secondary) px-2.5 py-1 rounded-lg">
                                                    {dept.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {dept.hod ? (
                                                    <div>
                                                        <p className="font-bold text-sm text-(--text-primary)">
                                                            {(dept.hod as any).firstName} {(dept.hod as any).lastName}
                                                        </p>
                                                        <p className="text-xs text-(--text-secondary) font-medium mt-0.5">{(dept.hod as any).email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                                                        Not Assigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-(--text-primary)">
                                                {dept.capacity || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Chip
                                                    label={dept.isActive ? "Active" : "Inactive"}
                                                    size="small"
                                                    className={`text-[10px]! font-bold! uppercase! tracking-wider! h-5! px-1.5! border ${dept.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-(--bg-base) text-(--text-secondary) border-(--ui-border)"}`}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <IconButton size="small" title="Edit"
                                                        onClick={() => { setEditingDept(dept); setDrawerOpen(true); }}
                                                        sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}>
                                                        <Pencil size={16} />
                                                    </IconButton>
                                                    <IconButton size="small" title={dept.isActive ? "Deactivate" : "Activate"}
                                                        onClick={() => toggleStatus(dept._id)}
                                                        sx={{ color: "var(--text-secondary)", "&:hover": { bgcolor: "var(--bg-base)" } }}>
                                                        {dept.isActive
                                                            ? <ToggleRight size={16} className="text-emerald-500" />
                                                            : <ToggleLeft size={16} />
                                                        }
                                                    </IconButton>
                                                    {dept.hod ? (
                                                        <IconButton size="small" title="Remove HOD"
                                                            onClick={() => removeHOD(dept._id)}
                                                            sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--status-danger)", bgcolor: "var(--bg-base)" } }}>
                                                            <UserX size={16} />
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton size="small" title="Assign HOD"
                                                            onClick={() => setAssignDept(dept)}
                                                            sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}>
                                                            <UserCheck size={16} />
                                                        </IconButton>
                                                    )}
                                                    <IconButton size="small" title="Delete"
                                                        onClick={() => deleteDept(dept._id)}
                                                        sx={{ color: "var(--text-secondary)", "&:hover": { color: "var(--status-danger)", bgcolor: "var(--bg-base)" } }}>
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {!isLoading && departments.length === 0 && (
                            <div className="text-center py-20 bg-(--bg-base)">
                                <BookOpen size={48} className="mx-auto text-(--text-secondary) opacity-30 mb-4" />
                                <p className="font-black text-(--text-primary) text-lg">No departments found</p>
                                <p className="text-sm font-medium text-(--text-secondary) mt-1">Click "New Department" to add your first academic department.</p>
                            </div>
                        )}
                    </div>
                    <TablePagination
                        component="div"
                        count={pagination?.total ?? departments.length}
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

            <DeptDrawer
                open={drawerOpen}
                editing={editingDept}
                onClose={() => { setDrawerOpen(false); setEditingDept(null); }}
            />
            <AssignHODDialog
                open={!!assignDept}
                dept={assignDept}
                onClose={() => setAssignDept(null)}
            />
        </div>
    );
};

export default Departments;