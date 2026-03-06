import { useMemo, useState } from "react";
import {
    IconButton, Avatar, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Stepper, Step, StepLabel,
    Tooltip, CircularProgress, TablePagination,
} from "@mui/material";
import {
    Users, Building2, MoreVertical, Search, Plus, Filter,
    Download, ChevronRight, MapPin, Activity, ArrowUpRight,
    X, UserPlus, ExternalLink, CheckCircle2, Pencil, Trash2,
} from "lucide-react";
import {
    XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar,
} from "recharts";
import {
    useGetAllInstitutesQuery,
    useCreateInstituteMutation,
    useUpdateInstituteMutation,
    useDeleteInstituteMutation,
    useToggleInstituteStatusMutation,
    useAssignPrincipalMutation,
    type Institute,
    type CreateInstitutePayload,
} from "../../services/institute/institute.service";
import { useGetAllUsersQuery } from "../../services/user/user.service";

const CHART_DATA = [
    { name: "Jan", value: 400 }, { name: "Feb", value: 300 },
    { name: "Mar", value: 600 }, { name: "Apr", value: 800 },
    { name: "May", value: 500 }, { name: "Jun", value: 900 },
];

const WIZARD_STEPS = ["General", "Contact", "Details", "Review"];

const INST_TYPES = [
    { value: "university", label: "University" },
    { value: "college", label: "College" },
    { value: "school", label: "School" },
    { value: "polytechnic", label: "Polytechnic" },
];

const inputCls =
    "w-full bg-(--bg-base) border border-(--ui-border) rounded-lg px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-colors";
const labelCls =
    "text-xs font-semibold text-(--text-secondary)";

const emptyForm = (): CreateInstitutePayload => ({
    name: "", domain: "",
    location: { address: "", city: "", country: "" },
    contactPhone: "", contactEmail: "", website: "",
    type: "university", establishedYear: undefined,
    logoInitials: "",
});

const Institutes = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [formData, setFormData] = useState<CreateInstitutePayload>(emptyForm());
    const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);
    const [principalId, setPrincipalId] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState<Partial<CreateInstitutePayload>>({});
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3500);
    };

    const queryParams = useMemo(() => ({
        search: search || undefined,
        page: page + 1,
        limit: rowsPerPage,
    }), [search, page, rowsPerPage]);

    const { data: institutesData, isLoading } = useGetAllInstitutesQuery(queryParams);
    const {
        data: principalsData,
        isFetching: isPrincipalsLoading,
        isError: isPrincipalsError,
    } = useGetAllUsersQuery({
        role: "principal",
        page: 1,
        limit: 200,
    });

    const [createInstitute, { isLoading: creating }] = useCreateInstituteMutation();
    const [updateInstitute, { isLoading: updating }] = useUpdateInstituteMutation();
    const [deleteInstitute, { isLoading: deleting }] = useDeleteInstituteMutation();
    const [toggleStatus, { isLoading: toggling }] = useToggleInstituteStatusMutation();
    const [assignPrincipal, { isLoading: assigning }] = useAssignPrincipalMutation();

    const institutes = institutesData?.data ?? [];
    const pagination = institutesData?.pagination;
    const principalUsers = principalsData?.data ?? [];

    const kpiData = useMemo(() => {
        const total = institutesData?.pagination?.total ?? institutes.length;
        const active = institutes.filter((i) => i.isActive).length;
        const students = institutes.reduce((s, i) => s + i.studentsCount, 0);
        return [
            { label: "Total Institutes", value: String(total), trend: "+4", icon: Building2 },
            { label: "Active Nodes", value: String(active), trend: "+2", icon: Activity },
            { label: "Total Students", value: students.toLocaleString(), trend: "+12%", icon: Users },
            { label: "Revenue", value: "$2.4M", trend: "+8%", icon: ArrowUpRight },
        ];
    }, [institutes, institutesData]);

    const setField = (key: string, val: string | number) =>
        setFormData((p) => ({ ...p, [key]: val }));
    const setLocField = (key: string, val: string) =>
        setFormData((p) => ({ ...p, location: { ...p.location, [key]: val } }));

    const openWizard = () => { setFormData(emptyForm()); setWizardStep(0); setIsWizardOpen(true); };

    const handleCreate = async () => {
        try {
            await createInstitute(formData).unwrap();
            setIsWizardOpen(false);
            showToast("Institute created successfully!");
        } catch (e: any) {
            showToast(e?.data?.message ?? "Failed to create institute", false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedInstitute) return;
        try {
            const res = await updateInstitute({ id: selectedInstitute._id, data: editData }).unwrap();
            setSelectedInstitute(res.data);
            setIsEditOpen(false);
            showToast("Institute updated successfully!");
        } catch (e: any) {
            showToast(e?.data?.message ?? "Failed to update", false);
        }
    };

    const handleDelete = async () => {
        if (!selectedInstitute) return;
        try {
            await deleteInstitute(selectedInstitute._id).unwrap();
            setSelectedInstitute(null);
            setDeleteConfirm(false);
            showToast("Institute deleted.");
        } catch (e: any) {
            showToast(e?.data?.message ?? "Failed to delete", false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedInstitute) return;
        try {
            const res = await toggleStatus(selectedInstitute._id).unwrap();
            setSelectedInstitute(res.data);
            showToast(`Institute ${res.data.isActive ? "activated" : "suspended"}!`);
        } catch (e: any) {
            showToast(e?.data?.message ?? "Failed to toggle status", false);
        }
    };

    const handleAssignPrincipal = async () => {
        if (!selectedInstitute || !principalId.trim()) return;
        try {
            const res = await assignPrincipal({ id: selectedInstitute._id, principalId: principalId.trim() }).unwrap();
            setSelectedInstitute(res.data);
            setIsPrincipalModalOpen(false);
            setPrincipalId("");
            showToast("Principal assigned!");
        } catch (e: any) {
            showToast(e?.data?.message ?? "Failed to assign principal", false);
        }
    };

    const buttonSx = {
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
    };

    return (
        <div className="w-full bg-(--bg-base) min-h-screen font-sans pb-10 relative">
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[200] px-4 py-2.5 rounded-lg shadow-lg text-sm font-semibold text-white transition-all ${toast.ok ? "bg-emerald-600" : "bg-rose-600"}`}>
                    {toast.msg}
                </div>
            )}

            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            Institute Management
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Manage and monitor all registered educational entities.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outlined" startIcon={<Download size={16} />}
                            sx={{ ...buttonSx, borderColor: "var(--ui-border)", color: "var(--text-primary)", "&:hover": { borderColor: "var(--brand-primary)", bgcolor: "var(--brand-active)" } }}>
                            Export Report
                        </Button>
                        <Button variant="contained" startIcon={<Plus size={16} />} onClick={openWizard}
                            sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                            Create Institute
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {kpiData.map((kpi, i) => (
                        <div key={i} className="p-5 bg-(--bg-surface) border border-(--ui-border) rounded-xl hover:border-(--brand-primary) transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2.5 rounded-lg bg-(--bg-base)">
                                    <kpi.icon size={20} className="text-(--brand-primary)" />
                                </div>
                                <div className="h-8 w-16 opacity-70">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={CHART_DATA}>
                                            <Area type="monotone" dataKey="value" stroke="var(--brand-primary)" fill="var(--brand-active)" fillOpacity={0.2} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-(--text-primary) tracking-tight flex items-center gap-2">
                                {kpi.value}
                                <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${kpi.trend.includes("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                                    {kpi.trend}
                                </span>
                            </h3>
                            <p className="text-xs font-semibold text-(--text-secondary) mt-1">
                                {kpi.label}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) shadow-sm overflow-hidden mb-8">
                    <div className="p-5 border-b border-(--ui-divider) flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                            <input type="text" placeholder="Search institutes..."
                                className="w-full bg-(--bg-base) border border-(--ui-border) rounded-lg pl-9 pr-3 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none transition-all"
                                value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="text" startIcon={<Filter size={16} />} sx={{ color: "var(--text-secondary)", textTransform: "none", fontWeight: 600 }}>Filters</Button>
                            <div className="h-5 w-px bg-(--ui-divider)" />
                            <p className="text-xs text-(--text-secondary) font-semibold">Showing {pagination?.total ?? institutes.length} results</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--bg-base) border-b border-(--ui-divider)">
                                    {["Institute Details", "Lead Principal", "Resources", "Status", "Management"].map((h, i) => (
                                        <th key={i} className={`px-5 py-3 text-xs font-bold text-(--text-secondary) uppercase tracking-wider ${i === 2 ? "text-center" : i === 4 ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 5 }).map((__, j) => (
                                                <td key={j} className="px-5 py-3">
                                                    <div className="h-4 bg-(--bg-base) rounded w-2/3 animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : institutes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center">
                                            <Building2 size={32} className="mx-auto mb-3 text-(--text-secondary) opacity-50" />
                                            <p className="text-sm font-semibold text-(--text-secondary)">No institutes registered</p>
                                        </td>
                                    </tr>
                                ) : (
                                    institutes.map((inst) => (
                                        <tr key={inst._id} className="hover:bg-(--bg-base) transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-(--bg-sidebar) flex items-center justify-center text-(--text-on-dark) font-bold text-xs shadow-sm">{inst.logoInitials}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-(--text-primary)">{inst.name}</p>
                                                        <div className="flex items-center gap-1 text-xs text-(--text-secondary) font-medium mt-0.5">
                                                            <MapPin size={12} />{inst.location.city}, {inst.location.country}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                {inst.principal ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar sx={{ width: 28, height: 28, fontSize: "12px", fontWeight: 700, bgcolor: "var(--brand-primary)" }}>{inst.principal.firstName.charAt(0)}</Avatar>
                                                        <span className="text-sm font-semibold text-(--text-primary)">{inst.principal.firstName} {inst.principal.lastName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold text-(--text-secondary) opacity-80">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <div className="inline-flex gap-5">
                                                    <div className="text-center"><p className="text-sm font-bold text-(--text-primary)">{inst.departmentsCount}</p><p className="text-[10px] text-(--text-secondary) uppercase font-semibold">Depts</p></div>
                                                    <div className="text-center"><p className="text-sm font-bold text-(--text-primary)">{inst.facultyCount ?? 0}</p><p className="text-[10px] text-(--text-secondary) uppercase font-semibold">Faculty</p></div>
                                                    <div className="text-center"><p className="text-sm font-bold text-(--text-primary)">{inst.studentsCount}</p><p className="text-[10px] text-(--text-secondary) uppercase font-semibold">Students</p></div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${inst.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                                    {inst.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => setSelectedInstitute(inst)}>
                                                            <ExternalLink size={16} className="text-(--text-secondary) hover:text-(--brand-primary) transition-colors" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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

            <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedInstitute ? "translate-x-0" : "translate-x-full"}`}>
                {selectedInstitute && (
                    <div className="h-full flex flex-col">
                        <div className="p-5 border-b border-(--ui-divider) flex items-center justify-between bg-(--bg-base)">
                            <h2 className="text-base font-bold text-(--text-primary) tracking-tight">Institutional Profile</h2>
                            <IconButton onClick={() => setSelectedInstitute(null)} size="small"><X size={18} /></IconButton>
                        </div>
                        <div className="grow overflow-y-auto p-6 space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-xl bg-(--bg-sidebar) flex items-center justify-center text-white text-2xl font-black mb-4 shadow-sm">{selectedInstitute.logoInitials}</div>
                                <h3 className="text-xl font-bold text-(--text-primary)">{selectedInstitute.name}</h3>
                                <p className="text-(--text-secondary) flex items-center justify-center gap-1.5 mt-1 font-medium text-sm">
                                    <MapPin size={14} />{selectedInstitute.location.city}, {selectedInstitute.location.country}
                                </p>
                                <div className={`mt-3 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${selectedInstitute.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                    {selectedInstitute.isActive ? "Active" : "Suspended"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { val: selectedInstitute.studentsCount, lbl: "Students" },
                                    { val: selectedInstitute.departmentsCount, lbl: "Depts" },
                                    { val: selectedInstitute.facultyCount ?? 0, lbl: "Faculty" },
                                    { val: selectedInstitute.type, lbl: "Type" },
                                ].map(({ val, lbl }) => (
                                    <div key={lbl} className="bg-(--bg-base) p-3 rounded-xl text-center border border-(--ui-border)">
                                        <p className="text-base font-bold text-(--text-primary) truncate">{val}</p>
                                        <p className="text-[10px] font-semibold text-(--text-secondary) uppercase tracking-wider">{lbl}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedInstitute.domain && (
                                <div className="bg-(--bg-base) p-3.5 rounded-xl border border-(--ui-border) text-sm flex flex-col">
                                    <span className="text-xs font-semibold text-(--text-secondary) mb-0.5">Primary Domain</span>
                                    <span className="font-bold text-(--text-primary)">{selectedInstitute.domain}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider border-b border-(--ui-divider) pb-2">Leadership Team</h4>
                                <div className="p-4 rounded-xl border border-(--ui-border) bg-(--bg-base) flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: "var(--bg-sidebar)", fontSize: "16px", fontWeight: 700 }}>
                                            {selectedInstitute.principal?.firstName?.charAt(0) ?? "?"}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-(--text-primary)">
                                                {selectedInstitute.principal ? `${selectedInstitute.principal.firstName} ${selectedInstitute.principal.lastName}` : "No assignment"}
                                            </p>
                                            <p className="text-xs text-(--text-secondary) font-medium">Head Principal</p>
                                        </div>
                                    </div>
                                    <Tooltip title="Assign New Principal">
                                        <IconButton size="small"
                                            onClick={() => { setPrincipalId(selectedInstitute.principal?._id ?? ""); setIsPrincipalModalOpen(true); }}
                                        ><UserPlus size={16} className="text-(--brand-primary)" /></IconButton>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="space-y-2.5 pt-2">
                                <Button variant="contained" fullWidth onClick={() => { setEditData({ name: selectedInstitute.name, domain: selectedInstitute.domain, type: selectedInstitute.type, logoInitials: selectedInstitute.logoInitials }); setIsEditOpen(true); }}
                                    sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", py: 1.25, boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                                    <Pencil size={14} className="mr-2" /> Modify Profile
                                </Button>
                                <Button variant="outlined" fullWidth onClick={handleToggleStatus} disabled={toggling}
                                    sx={{ ...buttonSx, borderColor: "var(--ui-border)", color: "var(--text-primary)", py: 1.25 }}>
                                    {toggling ? <CircularProgress size={16} /> : (selectedInstitute.isActive ? "Suspend Institute" : "Reactivate Institute")}
                                </Button>
                                <Button variant="outlined" fullWidth color="error" onClick={() => setDeleteConfirm(true)}
                                    sx={{ ...buttonSx, py: 1.25 }}>
                                    <Trash2 size={14} className="mr-2" /> Permanently Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={isWizardOpen} onClose={() => setIsWizardOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Register New Institute</DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Stepper activeStep={wizardStep} sx={{ my: 3 }}>
                        {WIZARD_STEPS.map((label) => (
                            <Step key={label} sx={{ "& .MuiStepLabel-label": { fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" } }}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div className="py-2 min-h-[280px]">
                        {wizardStep === 0 && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Institute Name *</label>
                                    <input className={inputCls} placeholder="e.g. Global Tech University" value={formData.name} onChange={(e) => setField("name", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Primary Domain *</label>
                                    <input className={inputCls} placeholder="university.edu" value={formData.domain} onChange={(e) => setField("domain", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Logo Initials *</label>
                                    <input className={inputCls} placeholder="e.g. GTU" maxLength={3} value={formData.logoInitials} onChange={(e) => setField("logoInitials", e.target.value.toUpperCase())} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Classification Type *</label>
                                    <select className={inputCls} value={formData.type} onChange={(e) => setField("type", e.target.value)}>
                                        {INST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {wizardStep === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Street Address *</label>
                                    <input className={inputCls} placeholder="123 Main Street" value={formData.location.address} onChange={(e) => setLocField("address", e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>City *</label>
                                        <input className={inputCls} placeholder="London" value={formData.location.city} onChange={(e) => setLocField("city", e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={labelCls}>Country *</label>
                                        <input className={inputCls} placeholder="United Kingdom" value={formData.location.country} onChange={(e) => setLocField("country", e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Contact Phone</label>
                                    <input className={inputCls} placeholder="+44 20 0000 0000" value={formData.contactPhone ?? ""} onChange={(e) => setField("contactPhone", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Contact Email</label>
                                    <input className={inputCls} type="email" placeholder="info@university.edu" value={formData.contactEmail ?? ""} onChange={(e) => setField("contactEmail", e.target.value)} />
                                </div>
                            </div>
                        )}
                        {wizardStep === 2 && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Website URL</label>
                                    <input className={inputCls} placeholder="https://university.edu" value={formData.website ?? ""} onChange={(e) => setField("website", e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Established Year</label>
                                    <input className={inputCls} type="number" placeholder="e.g. 1998" value={formData.establishedYear ?? ""} onChange={(e) => setField("establishedYear", parseInt(e.target.value))} />
                                </div>
                            </div>
                        )}
                        {wizardStep === 3 && (
                            <div className="space-y-3">
                                <div className="flex flex-col items-center text-center mb-3">
                                    <div className="w-14 h-14 rounded-xl bg-(--bg-sidebar) flex items-center justify-center text-white text-xl font-bold mb-2">{formData.logoInitials || "?"}</div>
                                    <h4 className="text-lg font-bold text-(--text-primary)">{formData.name || "Unnamed"}</h4>
                                    <p className="text-sm text-(--text-secondary) font-medium">{formData.domain}</p>
                                </div>
                                <div className="bg-(--bg-base) border border-(--ui-border) rounded-lg p-1">
                                    {[
                                        { label: "Location", value: `${formData.location.city}, ${formData.location.country}` },
                                        { label: "Type", value: formData.type },
                                        { label: "Contact Email", value: formData.contactEmail || "Not provided" },
                                        { label: "Website", value: formData.website || "Not provided" },
                                        { label: "Established", value: formData.establishedYear ? String(formData.establishedYear) : "Not provided" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between py-2.5 px-3 border-b border-(--ui-divider) last:border-0">
                                            <span className="text-xs font-semibold text-(--text-secondary)">{label}</span>
                                            <span className="text-sm font-bold text-(--text-primary) capitalize">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setIsWizardOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <div className="grow" />
                    {wizardStep > 0 && (
                        <Button onClick={() => setWizardStep((p) => p - 1)} sx={{ fontWeight: 600, color: "var(--text-primary)", textTransform: "none" }}>Back</Button>
                    )}
                    <Button variant="contained"
                        onClick={wizardStep === 3 ? handleCreate : () => setWizardStep((p) => p + 1)}
                        disabled={creating}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", px: 3, boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {creating ? <CircularProgress size={16} color="inherit" /> : wizardStep === 3 ? "Launch Institute" : "Continue"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Update Details</DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <div className="space-y-4 pt-2">
                        {[
                            { key: "name", label: "Name", placeholder: "Institute Name" },
                            { key: "domain", label: "Domain", placeholder: "university.edu" },
                            { key: "logoInitials", label: "Logo Initials", placeholder: "GTU" },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <label className={labelCls}>{label}</label>
                                <input className={inputCls} placeholder={placeholder} value={(editData as any)[key] ?? ""}
                                    onChange={(e) => setEditData((p) => ({ ...p, [key]: e.target.value }))} />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <label className={labelCls}>Classification Type</label>
                            <select className={inputCls} value={editData.type ?? "university"} onChange={(e) => setEditData((p) => ({ ...p, type: e.target.value as any }))}>
                                {INST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setIsEditOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdate} disabled={updating}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", px: 3, boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {updating ? <CircularProgress size={16} color="inherit" /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isPrincipalModalOpen} onClose={() => setIsPrincipalModalOpen(false)} PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Assign Chief Executive</DialogTitle>
                <DialogContent sx={{ width: 440, px: 3 }}>
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg mb-5 mt-2">
                        <p className="text-rose-700 text-xs font-semibold leading-relaxed">Warning: Reassigning a principal will immediately transfer administrative rights and revoke access for the current occupant.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Select User</label>
                        <select
                            className={inputCls}
                            value={principalId}
                            onChange={(e) => setPrincipalId(e.target.value)}
                            disabled={isPrincipalsLoading}
                        >
                            <option value="">
                                {isPrincipalsLoading
                                    ? "Loading available principals..."
                                    : "Choose an available principal"}
                            </option>
                            {principalUsers.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </option>
                            ))}
                        </select>
                        {isPrincipalsError && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-1">Failed to fetch principal directory.</p>
                        )}
                        {!isPrincipalsLoading && !isPrincipalsError && principalUsers.length === 0 && (
                            <p className="text-[10px] text-(--text-secondary) font-semibold mt-1">No vacant principal accounts located. Provision a principal user first.</p>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => { setIsPrincipalModalOpen(false); setPrincipalId(""); }} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignPrincipal} disabled={assigning || !principalId.trim()}
                        sx={{ ...buttonSx, bgcolor: "var(--brand-primary)", px: 3, boxShadow: "none", "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" } }}>
                        {assigning ? <CircularProgress size={16} color="inherit" /> : "Confirm Assignment"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} PaperProps={{ sx: { borderRadius: "12px", border: "1px solid var(--ui-border)" } }}>
                <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1, fontSize: "1.125rem" }}>Confirm Deletion</DialogTitle>
                <DialogContent sx={{ px: 3, pb: 1 }}>
                    <p className="text-sm text-(--text-secondary) font-medium">Are you sure you wish to permanently delete the <strong className="text-(--text-primary)">{selectedInstitute?.name}</strong> node? This destroys all associated data.</p>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setDeleteConfirm(false)} sx={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "none" }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
                        sx={{ ...buttonSx, px: 3, boxShadow: "none" }}>
                        {deleting ? <CircularProgress size={16} color="inherit" /> : "Delete Node"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Institutes;
