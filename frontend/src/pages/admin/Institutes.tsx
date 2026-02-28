import React, { useState, useMemo } from "react";
import {
    IconButton, Avatar, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Stepper, Step, StepLabel,
    Tooltip, CircularProgress,
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
    "w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none";
const labelCls =
    "text-[10px] font-black text-(--text-secondary) uppercase tracking-widest";

const emptyForm = (): CreateInstitutePayload => ({
    name: "", domain: "",
    location: { address: "", city: "", country: "" },
    contactPhone: "", contactEmail: "", website: "",
    type: "university", establishedYear: undefined,
    logoInitials: "",
});

const Institutes = () => {
    const [search, setSearch] = useState("");
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

    const { data: institutesData, isLoading } = useGetAllInstitutesQuery(
        search ? { search } : undefined,
    );

    const [createInstitute, { isLoading: creating }] = useCreateInstituteMutation();
    const [updateInstitute, { isLoading: updating }] = useUpdateInstituteMutation();
    const [deleteInstitute, { isLoading: deleting }] = useDeleteInstituteMutation();
    const [toggleStatus, { isLoading: toggling }] = useToggleInstituteStatusMutation();
    const [assignPrincipal, { isLoading: assigning }] = useAssignPrincipalMutation();

    const institutes = institutesData?.data ?? [];

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

    return (
        <div className="grow bg-(--bg-base) min-h-screen font-sans">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white transition-all ${toast.ok ? "bg-emerald-500" : "bg-rose-500"
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="h-20 bg-(--bg-surface) border-b border-(--ui-border) px-8 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-(--text-secondary) uppercase tracking-widest mb-1">
                        <span>Dashboard</span>
                        <ChevronRight size={10} />
                        <span className="text-(--text-primary)">Institutes</span>
                    </div>
                    <h1 className="text-xl font-black text-(--text-primary)">Institute Management</h1>
                    <p className="text-[11px] text-(--text-secondary) font-medium">Manage and monitor all registered educational entities</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outlined" startIcon={<Download size={18} />} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "var(--ui-border)", color: "var(--text-primary)" }}>
                        Export Report
                    </Button>
                    <Button variant="contained" startIcon={<Plus size={18} />} onClick={openWizard}
                        sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: "var(--brand-primary)", boxShadow: "none" }}>
                        Create Institute
                    </Button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiData.map((kpi, i) => (
                        <div key={i} className="bg-(--bg-surface) p-6 rounded-2xl border border-(--ui-border) shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-(--bg-base)"><kpi.icon size={22} className="text-(--brand-primary)" /></div>
                                <div className="h-10 w-20">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={CHART_DATA}>
                                            <Area type="monotone" dataKey="value" stroke="var(--brand-primary)" fill="var(--brand-active)" fillOpacity={0.2} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <p className="text-[11px] font-black text-(--text-secondary) uppercase tracking-widest">{kpi.label}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-black text-(--text-primary)">{kpi.value}</h3>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpi.trend.includes("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>{kpi.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-(--bg-surface) rounded-2xl border border-(--ui-border) shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-(--ui-divider) flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" />
                            <input type="text" placeholder="Search institutes..." className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="text" startIcon={<Filter size={16} />} sx={{ color: "var(--text-secondary)", textTransform: "none", fontWeight: 600 }}>Filters</Button>
                            <div className="h-6 w-px bg-(--ui-divider)" />
                            <p className="text-xs text-(--text-secondary) font-medium">Showing {institutes.length} institutes</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--bg-base)/50 border-b border-(--ui-divider)">
                                    {["Institute Details", "Lead Principal", "Resources", "Status", "Management"].map((h, i) => (
                                        <th key={i} className={`px-6 py-4 text-[11px] font-black text-(--text-secondary) uppercase tracking-widest ${i === 2 ? "text-center" : i === 4 ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 5 }).map((__, j) => (
                                                <td key={j} className="px-6 py-5">
                                                    <div className="h-4 bg-(--bg-base) rounded-lg animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : institutes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <Building2 size={40} className="mx-auto mb-3 text-(--text-secondary) opacity-30" />
                                            <p className="text-sm font-bold text-(--text-secondary)">No institutes found</p>
                                            <p className="text-xs text-(--text-secondary) mt-1">Create one using the button above</p>
                                        </td>
                                    </tr>
                                ) : (
                                    institutes.map((inst) => (
                                        <tr key={inst._id} className="hover:bg-(--bg-base)/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-(--bg-sidebar) flex items-center justify-center text-(--text-on-dark) font-black text-xs shadow-sm">{inst.logoInitials}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-(--text-primary)">{inst.name}</p>
                                                        <div className="flex items-center gap-1 text-xs text-(--text-secondary)">
                                                            <MapPin size={12} />{inst.location.city}, {inst.location.country}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inst.principal ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: "var(--brand-primary)" }}>{inst.principal.firstName.charAt(0)}</Avatar>
                                                        <span className="text-sm font-semibold text-(--text-primary)">{inst.principal.firstName} {inst.principal.lastName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-(--text-secondary) italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex gap-4">
                                                    <div className="text-center"><p className="text-xs font-black text-(--text-primary)">{inst.departmentsCount}</p><p className="text-[9px] text-(--text-secondary) uppercase font-bold">Depts</p></div>
                                                    <div className="text-center"><p className="text-xs font-black text-(--text-primary)">{inst.studentsCount}</p><p className="text-[9px] text-(--text-secondary) uppercase font-bold">Students</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inst.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"}`}>
                                                    {inst.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => setSelectedInstitute(inst)}>
                                                            <ExternalLink size={18} className="text-(--text-secondary) group-hover:text-(--brand-primary)" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <IconButton size="small"><MoreVertical size={18} className="text-(--text-secondary)" /></IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-(--bg-surface) p-8 rounded-2xl border border-(--ui-border) shadow-sm">
                        <h3 className="text-lg font-black text-(--text-primary) mb-6">Student Enrollment Per Institute</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CHART_DATA}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <RechartsTooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                    <Bar dataKey="value" fill="var(--brand-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-(--bg-surface) p-8 rounded-2xl border border-(--ui-border) shadow-sm">
                        <h3 className="text-lg font-black text-(--text-primary) mb-6">System Audit & Activity</h3>
                        <div className="space-y-6">
                            {[
                                { action: "Principal Assigned", target: "Latest Institute", time: "Just now", admin: "SuperAdmin" },
                                { action: "New Institute Created", target: "Via Admin Panel", time: "5 min ago", admin: "SuperAdmin" },
                                { action: "Status Toggled", target: "An Institute", time: "1 hour ago", admin: "System" },
                            ].map((log, idx) => (
                                <div key={idx} className="flex gap-4 items-start pb-4 border-b border-(--ui-divider) last:border-0 last:pb-0">
                                    <div className={`p-2 rounded-lg ${log.action.includes("Toggled") ? "bg-rose-50" : "bg-(--bg-base)"}`}>
                                        <Activity size={16} className={log.action.includes("Toggled") ? "text-rose-500" : "text-(--brand-primary)"} />
                                    </div>
                                    <div className="grow">
                                        <p className="text-sm font-bold text-(--text-primary)">{log.action} <span className="text-(--text-secondary) font-medium">on {log.target}</span></p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-(--brand-primary) uppercase">{log.admin}</span>
                                            <span className="text-[10px] text-(--text-secondary)">â€¢ {log.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedInstitute ? "translate-x-0" : "translate-x-full"}`}>
                {selectedInstitute && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-(--ui-divider) flex items-center justify-between bg-(--bg-base)/30">
                            <h2 className="text-lg font-black text-(--text-primary) tracking-tight">Institutional Profile</h2>
                            <IconButton onClick={() => setSelectedInstitute(null)}><X size={20} /></IconButton>
                        </div>
                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-(--bg-sidebar) flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg ring-4 ring-(--bg-base)">{selectedInstitute.logoInitials}</div>
                                <h3 className="text-2xl font-black text-(--text-primary)">{selectedInstitute.name}</h3>
                                <p className="text-(--text-secondary) flex items-center gap-1 mt-1 font-semibold text-sm">
                                    <MapPin size={14} />{selectedInstitute.location.city}, {selectedInstitute.location.country}
                                </p>
                                <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedInstitute.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}>
                                    {selectedInstitute.isActive ? "Active" : "Suspended"}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { val: selectedInstitute.studentsCount, lbl: "Students" },
                                    { val: selectedInstitute.departmentsCount, lbl: "Departments" },
                                    { val: selectedInstitute.type, lbl: "Type" },
                                ].map(({ val, lbl }) => (
                                    <div key={lbl} className="bg-(--bg-base) p-4 rounded-2xl text-center border border-(--ui-border)">
                                        <p className="text-lg font-black text-(--text-primary) truncate">{val}</p>
                                        <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">{lbl}</p>
                                    </div>
                                ))}
                            </div>
                            {selectedInstitute.domain && (
                                <div className="bg-(--bg-base) p-4 rounded-xl border border-(--ui-border) text-sm">
                                    <span className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest block mb-1">Domain</span>
                                    <span className="font-semibold text-(--text-primary)">{selectedInstitute.domain}</span>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-(--ui-divider) pb-2">
                                    <h4 className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">Leadership</h4>
                                </div>
                                <div className="p-4 rounded-2xl border border-(--ui-divider) bg-white shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{ width: 44, height: 44, bgcolor: "var(--bg-sidebar)" }}>
                                            {selectedInstitute.principal?.firstName?.charAt(0) ?? "?"}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-(--text-primary)">
                                                {selectedInstitute.principal ? `${selectedInstitute.principal.firstName} ${selectedInstitute.principal.lastName}` : "No principal assigned"}
                                            </p>
                                            <p className="text-[11px] text-(--text-secondary) font-medium">Head of Institute</p>
                                        </div>
                                    </div>
                                    <Tooltip title="Assign Principal">
                                        <IconButton size="small" onClick={() => setIsPrincipalModalOpen(true)}><UserPlus size={18} /></IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4">
                                <Button variant="contained" fullWidth onClick={() => { setEditData({ name: selectedInstitute.name, domain: selectedInstitute.domain, type: selectedInstitute.type, logoInitials: selectedInstitute.logoInitials }); setIsEditOpen(true); }}
                                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, bgcolor: "var(--brand-primary)", py: 1.5, boxShadow: "none" }}>
                                    <Pencil size={16} className="mr-2" /> Edit Profile
                                </Button>
                                <Button variant="outlined" fullWidth onClick={handleToggleStatus} disabled={toggling}
                                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, borderColor: "var(--ui-border)", color: "var(--text-primary)", py: 1.5 }}>
                                    {toggling ? <CircularProgress size={16} /> : (selectedInstitute.isActive ? "Suspend Institute" : "Reactivate Institute")}
                                </Button>
                                <Button variant="outlined" fullWidth color="error" onClick={() => setDeleteConfirm(true)}
                                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, py: 1.5 }}>
                                    <Trash2 size={16} className="mr-2" /> Delete Institute
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Wizard */}
            <Dialog open={isWizardOpen} onClose={() => setIsWizardOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "24px" } }}>
                <DialogTitle sx={{ fontWeight: 900, color: "var(--text-primary)", px: 4, pt: 4 }}>New Institute Enrollment</DialogTitle>
                <DialogContent sx={{ px: 4 }}>
                    <Stepper activeStep={wizardStep} sx={{ my: 4 }}>
                        {WIZARD_STEPS.map((label) => (
                            <Step key={label} sx={{ "& .MuiStepLabel-label": { fontSize: "9px", fontWeight: 900, textTransform: "uppercase" } }}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div className="py-4 min-h-[300px]">
                        {/* Step 0 â€“ General */}
                        {wizardStep === 0 && (
                            <div className="space-y-5">
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
                                    <label className={labelCls}>Type *</label>
                                    <select className={inputCls} value={formData.type} onChange={(e) => setField("type", e.target.value)}>
                                        {INST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {/* Step 1 â€“ Contact */}
                        {wizardStep === 1 && (
                            <div className="space-y-5">
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
                        {/* Step 2 â€“ Details */}
                        {wizardStep === 2 && (
                            <div className="space-y-5">
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
                        {/* Step 3 â€“ Review */}
                        {wizardStep === 3 && (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center text-center mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-(--bg-sidebar) flex items-center justify-center text-white text-2xl font-black mb-3">{formData.logoInitials || "?"}</div>
                                    <h4 className="text-xl font-black text-(--text-primary)">{formData.name || "â€”"}</h4>
                                    <p className="text-sm text-(--text-secondary) font-medium">{formData.domain}</p>
                                </div>
                                {[
                                    { label: "Location", value: `${formData.location.city}, ${formData.location.country}` },
                                    { label: "Type", value: formData.type },
                                    { label: "Contact Email", value: formData.contactEmail || "â€”" },
                                    { label: "Website", value: formData.website || "â€”" },
                                    { label: "Established", value: formData.establishedYear ? String(formData.establishedYear) : "â€”" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between text-sm py-2 border-b border-(--ui-divider)">
                                        <span className="font-bold text-(--text-secondary)">{label}</span>
                                        <span className="font-semibold text-(--text-primary) capitalize">{value}</span>
                                    </div>
                                ))}
                                <div className="mt-4 p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                    <p className="text-sm text-emerald-700 font-medium">Ready to provision â€” click <strong>Launch Institute</strong> to create.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setIsWizardOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <div className="grow" />
                    {wizardStep > 0 && (
                        <Button onClick={() => setWizardStep((p) => p - 1)} sx={{ fontWeight: 700, color: "var(--text-primary)" }}>Back</Button>
                    )}
                    <Button variant="contained"
                        onClick={wizardStep === 3 ? handleCreate : () => setWizardStep((p) => p + 1)}
                        disabled={creating}
                        sx={{ bgcolor: "var(--brand-primary)", borderRadius: "10px", px: 4, fontWeight: 700, boxShadow: "none" }}>
                        {creating ? <CircularProgress size={18} color="inherit" /> : wizardStep === 3 ? "Launch Institute" : "Continue"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "24px" } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>Edit Institute</DialogTitle>
                <DialogContent sx={{ px: 4 }}>
                    <div className="space-y-5 pt-2">
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
                            <label className={labelCls}>Type</label>
                            <select className={inputCls} value={editData.type ?? "university"} onChange={(e) => setEditData((p) => ({ ...p, type: e.target.value as any }))}>
                                {INST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setIsEditOpen(false)} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdate} disabled={updating}
                        sx={{ bgcolor: "var(--brand-primary)", borderRadius: "10px", px: 3, fontWeight: 700, boxShadow: "none" }}>
                        {updating ? <CircularProgress size={16} color="inherit" /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Principal Modal */}
            <Dialog open={isPrincipalModalOpen} onClose={() => setIsPrincipalModalOpen(false)} PaperProps={{ sx: { borderRadius: "24px" } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>Assign Institute Head</DialogTitle>
                <DialogContent sx={{ width: 440, px: 4 }}>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6">
                        <p className="text-rose-700 text-[11px] font-bold leading-relaxed">SECURITY ADVISORY: Assigning a new Principal will transfer all ownership permissions and revoke the current occupant's ERP access.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelCls}>Principal User ID</label>
                        <input className={inputCls} placeholder="Enter User ID of the principal..." value={principalId} onChange={(e) => setPrincipalId(e.target.value)} />
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => { setIsPrincipalModalOpen(false); setPrincipalId(""); }} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignPrincipal} disabled={assigning || !principalId.trim()}
                        sx={{ bgcolor: "var(--brand-primary)", borderRadius: "10px", px: 3, fontWeight: 700, boxShadow: "none" }}>
                        {assigning ? <CircularProgress size={16} color="inherit" /> : "Assign Principal"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} PaperProps={{ sx: { borderRadius: "20px" } }}>
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>Confirm Deletion</DialogTitle>
                <DialogContent sx={{ px: 4, pb: 1 }}>
                    <p className="text-sm text-(--text-secondary)">Are you sure you want to permanently delete <strong className="text-(--text-primary)">{selectedInstitute?.name}</strong>? This action cannot be undone.</p>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button onClick={() => setDeleteConfirm(false)} sx={{ color: "var(--text-secondary)", fontWeight: 700 }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting}
                        sx={{ borderRadius: "10px", px: 3, fontWeight: 700, boxShadow: "none" }}>
                        {deleting ? <CircularProgress size={16} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Institutes;
