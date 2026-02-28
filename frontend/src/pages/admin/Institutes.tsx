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
} from "@mui/material";
import {
    Users,
    Building2,
    MoreVertical,
    Search,
    Plus,
    Filter,
    Download,
    ChevronRight,
    MapPin,
    Activity,
    ArrowUpRight,
    X,
    UserPlus,
    ExternalLink,
    CheckCircle2,
} from "lucide-react";
import {
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
} from "recharts";

const MOCK_INSTITUTES = [
    {
        id: 1,
        name: "Oxford International",
        location: "London, UK",
        principal: "Dr. Sarah Jenkins",
        depts: 12,
        students: 1250,
        status: "Active",
        date: "2023-10-12",
        logo: "OI",
    },
    {
        id: 2,
        name: "Stanford Technical",
        location: "California, USA",
        principal: "Mark Zuckerberg",
        depts: 8,
        students: 850,
        status: "Active",
        date: "2023-11-05",
        logo: "ST",
    },
    {
        id: 3,
        name: "Berlin Academy",
        location: "Berlin, DE",
        principal: "Hans Gruber",
        depts: 15,
        students: 2100,
        status: "Inactive",
        date: "2024-01-20",
        logo: "BA",
    },
    {
        id: 4,
        name: "Tokyo Science Poly",
        location: "Tokyo, JP",
        principal: "Hiroshi Sato",
        depts: 20,
        students: 3400,
        status: "Active",
        date: "2023-08-15",
        logo: "TS",
    },
    {
        id: 5,
        name: "Heritage School",
        location: "Delhi, IN",
        principal: "Anita Desai",
        depts: 10,
        students: 1100,
        status: "Active",
        date: "2024-02-10",
        logo: "HS",
    },
];

const KPI_DATA = [
    { label: "Total Institutes", value: "48", trend: "+4", icon: Building2 },
    { label: "Active Nodes", value: "42", trend: "+2", icon: Activity },
    { label: "Total Students", value: "142.5k", trend: "+12%", icon: Users },
    { label: "Revenue", value: "$2.4M", trend: "+8%", icon: ArrowUpRight },
];

const CHART_DATA = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
    { name: "May", value: 500 },
    { name: "Jun", value: 900 },
];

const AdminDashboard = () => {
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);

    const filteredInstitutes = useMemo(
        () =>
            MOCK_INSTITUTES.filter((inst) =>
                inst.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        [searchTerm],
    );

    const handleNextStep = () => setWizardStep((prev) => prev + 1);
    const handlePrevStep = () => setWizardStep((prev) => prev - 1);

    return (
        <div className="flex-grow bg-(--bg-base) min-h-screen font-sans">
            <header className="h-20 bg-(--bg-surface) border-b border-(--ui-border) px-8 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-(--text-secondary) uppercase tracking-widest mb-1">
                        <span>Dashboard</span>
                        <ChevronRight size={10} />
                        <span className="text-(--text-primary)">
                            Institutes
                        </span>
                    </div>
                    <h1 className="text-xl font-black text-(--text-primary)">
                        Institute Management
                    </h1>
                    <p className="text-[11px] text-(--text-secondary) font-medium">
                        Manage and monitor all registered educational entities
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outlined"
                        startIcon={<Download size={18} />}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            borderColor: "var(--ui-border)",
                            color: "var(--text-primary)",
                        }}
                    >
                        Export Report
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => {
                            setIsWizardOpen(true);
                            setWizardStep(0);
                        }}
                        sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "var(--brand-primary)",
                            boxShadow: "none",
                        }}
                    >
                        Create Institute
                    </Button>
                </div>
            </header>

            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {KPI_DATA.map((kpi, i) => (
                        <div
                            key={i}
                            className="bg-(--bg-surface) p-6 rounded-2xl border border-(--ui-border) shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-(--bg-base)">
                                    <kpi.icon
                                        size={22}
                                        className="text-(--brand-primary)"
                                    />
                                </div>
                                <div className="h-10 w-20">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart data={CHART_DATA}>
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="var(--brand-primary)"
                                                fill="var(--brand-active)"
                                                fillOpacity={0.2}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <p className="text-[11px] font-black text-(--text-secondary) uppercase tracking-widest">
                                {kpi.label}
                            </p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-black text-(--text-primary)">
                                    {kpi.value}
                                </h3>
                                <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpi.trend.includes("+") ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}
                                >
                                    {kpi.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-(--bg-surface) rounded-2xl border border-(--ui-border) shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-(--ui-divider) flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                            />
                            <input
                                type="text"
                                placeholder="Search by institute name, principal or location..."
                                className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="text"
                                startIcon={<Filter size={16} />}
                                sx={{
                                    color: "var(--text-secondary)",
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                Filters
                            </Button>
                            <div className="h-6 w-px bg-(--ui-divider)" />
                            <p className="text-xs text-(--text-secondary) font-medium">
                                Showing {filteredInstitutes.length} registered
                                institutes
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-(--bg-base)/50 border-b border-(--ui-divider)">
                                    <th className="px-6 py-4 text-[11px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Institute Details
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Lead Principal
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-black text-(--text-secondary) uppercase tracking-widest text-center">
                                        Resources
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-black text-(--text-secondary) uppercase tracking-widest text-right">
                                        Management
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {filteredInstitutes.map((inst) => (
                                    <tr
                                        key={inst.id}
                                        className="hover:bg-(--bg-base)/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-(--bg-sidebar) flex items-center justify-center text-(--text-on-dark) font-black text-xs shadow-sm">
                                                    {inst.logo}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-(--text-primary)">
                                                        {inst.name}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-xs text-(--text-secondary)">
                                                        <MapPin size={12} />
                                                        {inst.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        fontSize: "0.6rem",
                                                        bgcolor:
                                                            "var(--brand-primary)",
                                                    }}
                                                >
                                                    {inst.principal.charAt(0)}
                                                </Avatar>
                                                <span className="text-sm font-semibold text-(--text-primary)">
                                                    {inst.principal}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex gap-4">
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-(--text-primary)">
                                                        {inst.depts}
                                                    </p>
                                                    <p className="text-[9px] text-(--text-secondary) uppercase font-bold">
                                                        Depts
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-(--text-primary)">
                                                        {inst.students}
                                                    </p>
                                                    <p className="text-[9px] text-(--text-secondary) uppercase font-bold">
                                                        Students
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inst.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"}`}
                                            >
                                                {inst.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Tooltip title="View Institute Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setSelectedInstitute(
                                                                inst,
                                                            )
                                                        }
                                                    >
                                                        <ExternalLink
                                                            size={18}
                                                            className="text-(--text-secondary) group-hover:text-(--brand-primary)"
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton size="small">
                                                    <MoreVertical
                                                        size={18}
                                                        className="text-(--text-secondary)"
                                                    />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-(--bg-surface) p-8 rounded-2xl border border-(--ui-border) shadow-sm">
                        <h3 className="text-lg font-black text-(--text-primary) mb-6">
                            Student Enrollment Per Institute
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CHART_DATA}>
                                    <XAxis dataKey="name" hide />
                                    <RechartsTooltip
                                        cursor={{ fill: "transparent" }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="var(--brand-primary)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-(--bg-surface) p-8 rounded-2xl border border-(--ui-border) shadow-sm">
                        <h3 className="text-lg font-black text-(--text-primary) mb-6">
                            System Audit & Activity
                        </h3>
                        <div className="space-y-6">
                            {[
                                {
                                    action: "Principal Assigned",
                                    target: "Oxford International",
                                    time: "2 hours ago",
                                    admin: "SuperAdmin",
                                },
                                {
                                    action: "New Institute Created",
                                    target: "Heritage School",
                                    time: "5 hours ago",
                                    admin: "SuperAdmin",
                                },
                                {
                                    action: "Institute Deactivated",
                                    target: "Berlin Academy",
                                    time: "1 day ago",
                                    admin: "System",
                                },
                            ].map((log, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-4 items-start pb-4 border-b border-(--ui-divider) last:border-0 last:pb-0"
                                >
                                    <div
                                        className={`p-2 rounded-lg ${log.action.includes("Deactivated") ? "bg-rose-50" : "bg-(--bg-base)"}`}
                                    >
                                        <Activity
                                            size={16}
                                            className={
                                                log.action.includes(
                                                    "Deactivated",
                                                )
                                                    ? "text-rose-500"
                                                    : "text-(--brand-primary)"
                                            }
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-bold text-(--text-primary)">
                                            {log.action}{" "}
                                            <span className="text-(--text-secondary) font-medium">
                                                on {log.target}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-(--brand-primary) uppercase tracking-tighter">
                                                {log.admin}
                                            </span>
                                            <span className="text-[10px] text-(--text-secondary)">
                                                • {log.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-(--bg-surface) shadow-2xl z-50 transform transition-transform duration-300 border-l border-(--ui-border) ${selectedInstitute ? "translate-x-0" : "translate-x-full"}`}
            >
                {selectedInstitute && (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-(--ui-divider) flex items-center justify-between bg-(--bg-base)/30">
                            <h2 className="text-lg font-black text-(--text-primary) tracking-tight">
                                Institutional Profile
                            </h2>
                            <IconButton
                                onClick={() => setSelectedInstitute(null)}
                            >
                                <X size={20} />
                            </IconButton>
                        </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-(--bg-sidebar) flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg ring-4 ring-(--bg-base)">
                                    {selectedInstitute.logo}
                                </div>
                                <h3 className="text-2xl font-black text-(--text-primary)">
                                    {selectedInstitute.name}
                                </h3>
                                <p className="text-(--text-secondary) flex items-center gap-1 mt-1 font-semibold text-sm">
                                    <MapPin size={14} />{" "}
                                    {selectedInstitute.location}
                                </p>
                                <div
                                    className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedInstitute.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"}`}
                                >
                                    {selectedInstitute.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-(--bg-base) p-5 rounded-2xl text-center border border-(--ui-border)">
                                    <p className="text-2xl font-black text-(--text-primary)">
                                        {selectedInstitute.students}
                                    </p>
                                    <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                                        Students
                                    </p>
                                </div>
                                <div className="bg-(--bg-base) p-5 rounded-2xl text-center border border-(--ui-border)">
                                    <p className="text-2xl font-black text-(--text-primary)">
                                        {selectedInstitute.depts}
                                    </p>
                                    <p className="text-[10px] font-bold text-(--text-secondary) uppercase tracking-wider">
                                        Departments
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-(--ui-divider) pb-2">
                                    <h4 className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Leadership
                                    </h4>
                                </div>
                                <div className="p-4 rounded-2xl border border-(--ui-divider) bg-white shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                bgcolor: "var(--bg-sidebar)",
                                            }}
                                        >
                                            {selectedInstitute.principal.charAt(
                                                0,
                                            )}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-(--text-primary)">
                                                {selectedInstitute.principal}
                                            </p>
                                            <p className="text-[11px] text-(--text-secondary) font-medium">
                                                Head of Institute
                                            </p>
                                        </div>
                                    </div>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            setIsPrincipalModalOpen(true)
                                        }
                                        className="bg-(--bg-base) text-(--brand-primary)"
                                    >
                                        <UserPlus size={18} />
                                    </IconButton>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        bgcolor: "var(--brand-primary)",
                                        py: 1.5,
                                        boxShadow: "none",
                                    }}
                                >
                                    Detailed Analytics
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderColor: "var(--ui-border)",
                                        color: "var(--text-primary)",
                                        py: 1.5,
                                    }}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    color="error"
                                    sx={{
                                        borderRadius: "12px",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        py: 1.5,
                                    }}
                                >
                                    Suspend Institute
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: "24px" } }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        px: 4,
                        pt: 4,
                    }}
                >
                    New Institute Enrollment
                </DialogTitle>
                <DialogContent sx={{ px: 4 }}>
                    <Stepper activeStep={wizardStep} sx={{ my: 4 }}>
                        {["General", "Contact", "License", "Review"].map(
                            (label) => (
                                <Step
                                    key={label}
                                    sx={{
                                        "& .MuiStepLabel-label": {
                                            fontSize: "9px",
                                            fontWeight: 900,
                                            textTransform: "uppercase",
                                        },
                                    }}
                                >
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ),
                        )}
                    </Stepper>

                    <div className="py-4 min-h-[300px]">
                        {wizardStep === 0 && (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Institute Name
                                    </label>
                                    <input
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                        placeholder="e.g. Global Tech University"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Primary Domain
                                    </label>
                                    <input
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                        placeholder="university.edu"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                        Physical Location
                                    </label>
                                    <input
                                        className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                        placeholder="Street, City, Country"
                                    />
                                </div>
                            </div>
                        )}
                        {wizardStep === 3 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-xl font-black text-(--text-primary)">
                                    Ready to Provision
                                </h4>
                                <p className="text-sm text-(--text-secondary) font-medium max-w-[300px]">
                                    By clicking confirm, the institute instance
                                    will be deployed to the SaaS cluster.
                                </p>
                            </div>
                        )}
                        {(wizardStep === 1 || wizardStep === 2) && (
                            <div className="flex items-center justify-center h-full opacity-40 italic text-sm text-(--text-secondary)">
                                Configuration fields pending...
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button
                        onClick={() => setIsWizardOpen(false)}
                        sx={{ color: "var(--text-secondary)", fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <div className="flex-grow" />
                    {wizardStep > 0 && (
                        <Button
                            onClick={handlePrevStep}
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
                        onClick={
                            wizardStep === 3
                                ? () => setIsWizardOpen(false)
                                : handleNextStep
                        }
                        sx={{
                            bgcolor: "var(--brand-primary)",
                            borderRadius: "10px",
                            px: 4,
                            fontWeight: 700,
                            boxShadow: "none",
                        }}
                    >
                        {wizardStep === 3 ? "Launch Institute" : "Continue"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isPrincipalModalOpen}
                onClose={() => setIsPrincipalModalOpen(false)}
                PaperProps={{ sx: { borderRadius: "24px" } }}
            >
                <DialogTitle sx={{ fontWeight: 900, px: 4, pt: 4 }}>
                    Assign Institute Head
                </DialogTitle>
                <DialogContent sx={{ width: 440, px: 4 }}>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6">
                        <p className="text-rose-700 text-[11px] font-bold leading-relaxed">
                            SECURITY ADVISORY: Assigning a new Principal will
                            transfer all ownership permissions and revoke the
                            current occupant's ERP access.
                        </p>
                    </div>
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-(--text-secondary) uppercase tracking-widest">
                                Search Personnel
                            </label>
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
                                />
                                <input
                                    className="w-full bg-(--bg-base) border border-(--ui-border) rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-(--brand-primary) outline-none"
                                    placeholder="Find by name or staff ID..."
                                />
                            </div>
                        </div>
                        <div className="p-4 border border-(--ui-divider) rounded-2xl bg-(--bg-base)/20">
                            <p className="text-[9px] font-black text-(--text-secondary) uppercase mb-3 tracking-widest text-center">
                                Current Assignment Preview
                            </p>
                            <div className="flex items-center gap-3 justify-center">
                                <Avatar sx={{ width: 36, height: 36 }} />
                                <div>
                                    <p className="text-sm font-bold text-(--text-primary)">
                                        Awaiting selection...
                                    </p>
                                    <p className="text-[10px] text-(--text-secondary) font-medium italic">
                                        User must have 'Manager' status
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button
                        onClick={() => setIsPrincipalModalOpen(false)}
                        sx={{ color: "var(--text-secondary)", fontWeight: 700 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: "var(--brand-primary)",
                            borderRadius: "12px",
                            px: 4,
                            fontWeight: 700,
                            boxShadow: "none",
                        }}
                    >
                        Confirm Assignment
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
