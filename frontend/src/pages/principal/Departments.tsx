import { useState, useDeferredValue } from "react";
import {
    Button,
    IconButton,
    Breadcrumbs,
    Link,
    Typography,
    Chip,
    Drawer,
    TextField,
    Switch,
    FormControlLabel,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Plus,
    Search,
    ChevronRight,
    BookOpen,
    Users,
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

// ─── Create / Edit Drawer ─────────────────────────────────────────────────────
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
            PaperProps={{ sx: { width: 400, p: 4, bgcolor: "#FAFAFA" } }}>
            <h2 className="text-lg font-black text-slate-900 mb-1">
                {editing ? "Edit Department" : "New Department"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
                {editing ? "Update department information." : "Add a new department to your institute."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField fullWidth label="Department Name" required
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                <TextField fullWidth label="Department Code (e.g. CS)" required
                    value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} />
                <TextField fullWidth label="Description" multiline rows={3}
                    value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                <TextField fullWidth label="Student Capacity" type="number"
                    value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))} />

                <div className="flex gap-3 pt-4">
                    <Button fullWidth variant="outlined" onClick={onClose}
                        className="!border-slate-200 !text-slate-600 !normal-case !font-bold !rounded-xl">
                        Cancel
                    </Button>
                    <Button fullWidth type="submit" variant="contained" disabled={isLoading}
                        className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl">
                        {isLoading ? "Saving…" : editing ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

// ─── Assign HOD Dialog ────────────────────────────────────────────────────────
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
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
            <DialogTitle className="font-black text-slate-900">
                Assign HOD — {dept?.name}
            </DialogTitle>
            <DialogContent>
                <p className="text-sm text-slate-500 mb-4">
                    Select a user with HOD role to assign as Head of Department.
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {hodUsers.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No HOD-role users found.</p>
                    ) : (
                        hodUsers.map((u: any) => (
                            <button key={u._id}
                                onClick={() => setSelected(u._id)}
                                className={`w-full text-left p-3 rounded-xl border transition-colors ${selected === u._id
                                    ? "border-slate-900 bg-slate-50"
                                    : "border-slate-100 hover:border-slate-300"
                                    }`}
                            >
                                <p className="font-bold text-sm text-slate-900">{u.firstName} {u.lastName}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                            </button>
                        ))
                    )}
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} className="!text-slate-500 !font-bold !normal-case">Cancel</Button>
                <Button onClick={handleAssign} disabled={!selected || isLoading}
                    variant="contained" className="!bg-slate-900 !text-white !font-bold !normal-case !rounded-xl">
                    {isLoading ? "Assigning…" : "Assign HOD"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Departments = () => {
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [assignDept, setAssignDept] = useState<Department | null>(null);

    const deferredSearch = useDeferredValue(search);
    const { data, isLoading } = useGetDepartmentsQuery({ search: deferredSearch || undefined });
    const departments = data?.data ?? [];

    const [toggleStatus] = useToggleDepartmentStatusMutation();
    const [removeHOD] = useRemoveHODMutation();
    const [deleteDept] = useDeleteDepartmentMutation();

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div>
                        <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                            <Link underline="hover" href="/principal/dashboard"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Principal
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Departments
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">Departments</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input placeholder="Search departments…" value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-xs outline-none w-48 border-none" />
                        </div>
                        <Button variant="contained" startIcon={<Plus size={16} />}
                            onClick={() => { setEditingDept(null); setDrawerOpen(true); }}
                            className="!bg-slate-900 !text-white !normal-case !font-black !text-xs !rounded-xl !shadow-none">
                            New Department
                        </Button>
                    </div>
                </div>
            </header>

            {/* Table */}
            <main className="p-8">
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 text-left">
                                    {["Department", "Code", "HOD", "Capacity", "Status", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-50">
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <Skeleton height={20} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : departments.map((dept) => (
                                        <tr key={dept._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                        <BookOpen size={16} className="text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900">{dept.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{dept.description || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                                                    {dept.code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {dept.hod ? (
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-900">
                                                            {(dept.hod as any).firstName} {(dept.hod as any).lastName}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{(dept.hod as any).email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-amber-500">Not Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                {dept.capacity || "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Chip
                                                    label={dept.isActive ? "Active" : "Inactive"}
                                                    size="small"
                                                    className={`!text-[10px] !font-black !uppercase ${dept.isActive ? "!bg-emerald-50 !text-emerald-700" : "!bg-slate-100 !text-slate-500"}`}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <IconButton size="small" title="Edit"
                                                        onClick={() => { setEditingDept(dept); setDrawerOpen(true); }}>
                                                        <Pencil size={15} className="text-slate-500" />
                                                    </IconButton>
                                                    <IconButton size="small" title={dept.isActive ? "Deactivate" : "Activate"}
                                                        onClick={() => toggleStatus(dept._id)}>
                                                        {dept.isActive
                                                            ? <ToggleRight size={15} className="text-emerald-500" />
                                                            : <ToggleLeft size={15} className="text-slate-400" />
                                                        }
                                                    </IconButton>
                                                    {dept.hod ? (
                                                        <IconButton size="small" title="Remove HOD"
                                                            onClick={() => removeHOD(dept._id)}>
                                                            <UserX size={15} className="text-amber-500" />
                                                        </IconButton>
                                                    ) : (
                                                        <IconButton size="small" title="Assign HOD"
                                                            onClick={() => setAssignDept(dept)}>
                                                            <UserCheck size={15} className="text-blue-500" />
                                                        </IconButton>
                                                    )}
                                                    <IconButton size="small" title="Delete"
                                                        onClick={() => deleteDept(dept._id)}>
                                                        <Trash2 size={15} className="text-rose-400" />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {!isLoading && departments.length === 0 && (
                            <div className="text-center py-16">
                                <BookOpen size={40} className="mx-auto text-slate-200 mb-3" />
                                <p className="font-black text-slate-600">No departments yet</p>
                                <p className="text-sm text-slate-400 mt-1">Click "New Department" to add your first department.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Drawers / Dialogs */}
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
