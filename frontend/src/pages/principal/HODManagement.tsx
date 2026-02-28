import { useState } from "react";
import {
    Button, Breadcrumbs, Link, Typography, Chip, Skeleton,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Drawer, Alert, InputAdornment,
} from "@mui/material";
import {
    ChevronRight, Users, UserX, ArrowRightLeft, Search, Plus, Eye, EyeOff,
} from "lucide-react";
import { useGetAllUsersQuery, useCreateHODMutation } from "../../services/user/user.service";
import { useGetDepartmentsQuery, useAssignHODMutation, useRemoveHODMutation } from "../../services/department/department.service";
import { useDeferredValue } from "react";

// ─── Create HOD Drawer ────────────────────────────────────────────────────────
const CreateHODDrawer = ({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated?: (hodId: string) => void;
}) => {
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState("");
    const [createHOD, { isLoading }] = useCreateHODMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const result = await createHOD(form).unwrap();
            setForm({ firstName: "", lastName: "", email: "", password: "" });
            onCreated?.(result.data._id);
            onClose();
        } catch (err: any) {
            setError(err?.data?.message ?? "Failed to create HOD account.");
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}
            PaperProps={{ sx: { width: 420, p: 4, bgcolor: "#FAFAFA" } }}>
            <h2 className="text-lg font-black text-slate-900 mb-1">Create HOD Account</h2>
            <p className="text-xs text-slate-500 font-medium mb-6">
                Create a Head of Department account for your institute. After creation, you can assign them to a department.
            </p>

            {error && <Alert severity="error" className="mb-4 rounded-xl">{error}</Alert>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <TextField label="First Name" required size="small"
                        value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                    <TextField label="Last Name" required size="small"
                        value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
                <TextField label="Email Address" type="email" required size="small"
                    value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                <TextField
                    label="Password" required size="small"
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    helperText="Minimum 6 characters"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowPwd((p) => !p)}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <div className="flex gap-3 pt-4">
                    <Button fullWidth variant="outlined" onClick={onClose}
                        className="!border-slate-200 !text-slate-600 !normal-case !font-bold !rounded-xl">
                        Cancel
                    </Button>
                    <Button fullWidth type="submit" variant="contained" disabled={isLoading}
                        className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl">
                        {isLoading ? "Creating…" : "Create HOD"}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

// ─── Transfer HOD Dialog ──────────────────────────────────────────────────────
const TransferDialog = ({
    open,
    hod,
    onClose,
}: {
    open: boolean;
    hod: any;
    onClose: () => void;
}) => {
    const [targetDept, setTargetDept] = useState("");
    const { data: deptData } = useGetDepartmentsQuery();
    const [assignHOD, { isLoading: assigning }] = useAssignHODMutation();
    const [removeHOD] = useRemoveHODMutation();
    const departments = deptData?.data ?? [];

    const currentDept = departments.find((d) => d.hod && (d.hod as any)._id === hod?._id);

    const handleTransfer = async () => {
        if (!hod || !targetDept) return;
        try {
            if (currentDept) await removeHOD(currentDept._id).unwrap();
            await assignHOD({ id: targetDept, hodId: hod._id }).unwrap();
            onClose();
        } catch (_) { }
    };

    return (
        <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
            <DialogTitle className="font-black">
                {currentDept ? "Transfer HOD" : "Assign to Department"} — {hod?.firstName} {hod?.lastName}
            </DialogTitle>
            <DialogContent>
                <p className="text-sm text-slate-500 mb-4">
                    {currentDept
                        ? `Currently assigned to ${currentDept.name}. Select a new department to transfer to.`
                        : "Select a department to assign this HOD to."}
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {departments.filter((d) => d.isActive && d._id !== currentDept?._id).map((d) => (
                        <button key={d._id} onClick={() => setTargetDept(d._id)}
                            className={`w-full text-left p-3 rounded-xl border transition-colors ${targetDept === d._id ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-300"
                                }`}>
                            <p className="font-bold text-sm text-slate-900">{d.name}</p>
                            <p className="text-xs text-slate-400">{d.code} · {d.hod ? "Has HOD" : "No HOD"}</p>
                        </button>
                    ))}
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} className="!text-slate-500 !font-bold !normal-case">Cancel</Button>
                <Button onClick={handleTransfer} disabled={!targetDept || assigning}
                    variant="contained" className="!bg-slate-900 !text-white !font-bold !normal-case !rounded-xl">
                    {assigning ? "Transferring…" : currentDept ? "Transfer" : "Assign"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const HODManagement = () => {
    const [search, setSearch] = useState("");
    const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
    const [transferHod, setTransferHod] = useState<any>(null);

    const deferredSearch = useDeferredValue(search);
    const { data: usersData, isLoading } = useGetAllUsersQuery({ role: "hod", search: deferredSearch || undefined });
    const { data: deptData } = useGetDepartmentsQuery();
    const [removeHOD] = useRemoveHODMutation();

    const hods = usersData?.data ?? [];
    const departments = deptData?.data ?? [];

    const getDeptForHOD = (hodId: string) =>
        departments.find((d) => d.hod && (d.hod as any)._id === hodId);

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
                                HOD Management
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">HOD Management</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input placeholder="Search HODs…" value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-xs outline-none w-44" />
                        </div>
                        <Button variant="contained" startIcon={<Plus size={16} />}
                            onClick={() => setCreateDrawerOpen(true)}
                            className="!bg-slate-900 !text-white !normal-case !font-black !text-xs !rounded-xl !shadow-none">
                            Create HOD Account
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-8">
                {/* Rule banner */}
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 font-semibold flex items-center gap-2">
                    ⚠️ <strong>Rule:</strong>&nbsp;One department can have only one active HOD at a time.
                </div>

                {/* HOD Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height={200} className="rounded-2xl" variant="rectangular" sx={{ borderRadius: 3 }} />
                        ))
                        : hods.length === 0
                            ? (
                                <div className="col-span-3 text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <Users size={40} className="mx-auto text-slate-200 mb-3" />
                                    <p className="font-black text-slate-600">No HOD accounts yet</p>
                                    <p className="text-sm text-slate-400 mt-1 mb-4">
                                        Create HOD accounts and assign them to departments.
                                    </p>
                                    <Button variant="contained" startIcon={<Plus size={16} />}
                                        onClick={() => setCreateDrawerOpen(true)}
                                        className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl !shadow-none">
                                        Create First HOD
                                    </Button>
                                </div>
                            )
                            : hods.map((hod: any) => {
                                const dept = getDeptForHOD(hod._id);
                                return (
                                    <div key={hod._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
                                        {/* Avatar + Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg shrink-0">
                                                {hod.firstName?.[0]}{hod.lastName?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm text-slate-900 truncate">{hod.firstName} {hod.lastName}</p>
                                                <p className="text-xs text-slate-400 truncate">{hod.email}</p>
                                            </div>
                                        </div>

                                        {/* Department assignment */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Department</span>
                                            {dept ? (
                                                <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                    {dept.name}
                                                </span>
                                            ) : (
                                                <span className="font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <Chip
                                            label={hod.isActive ? "Active" : "Suspended"}
                                            size="small"
                                            className={`!text-[10px] !font-black !uppercase !self-start ${hod.isActive ? "!bg-emerald-50 !text-emerald-700" : "!bg-rose-50 !text-rose-600"
                                                }`}
                                        />

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-1">
                                            <Button size="small" variant="outlined"
                                                startIcon={<ArrowRightLeft size={13} />}
                                                onClick={() => setTransferHod(hod)}
                                                className="!border-slate-200 !text-slate-600 !normal-case !font-bold !text-[11px] !rounded-xl flex-1">
                                                {dept ? "Transfer" : "Assign"}
                                            </Button>
                                            {dept && (
                                                <Button size="small" variant="outlined"
                                                    startIcon={<UserX size={13} />}
                                                    onClick={() => removeHOD(dept._id)}
                                                    className="!border-amber-200 !text-amber-600 !normal-case !font-bold !text-[11px] !rounded-xl flex-1">
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    }
                </div>
            </main>

            {/* Create HOD Drawer */}
            <CreateHODDrawer
                open={createDrawerOpen}
                onClose={() => setCreateDrawerOpen(false)}
            />

            {/* Transfer / Assign Dialog */}
            <TransferDialog
                open={!!transferHod}
                hod={transferHod}
                onClose={() => setTransferHod(null)}
            />
        </div>
    );
};

export default HODManagement;
