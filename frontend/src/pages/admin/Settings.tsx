import React, { useState } from "react";
import {
    Button,
    Switch,
    TextField,
    MenuItem,
    Checkbox,
    Avatar,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Link,
    Typography,
    Divider,
    Tabs,
    Tab,
    Box,
    InputAdornment,
} from "@mui/material";
import {
    Save,
    RotateCcw,
    History,
    ShieldCheck,
    Settings as SettingsIcon,
    Users,
    Globe,
    Bell,
    Lock,
    UploadCloud,
    ChevronRight,
    Eye,
    EyeOff,
    Plus,
    Copy,
    Mail,
    Smartphone,
    Server,
    Zap,
} from "lucide-react";

const PERMISSIONS = [
    "Manage Users",
    "Assign Roles",
    "Manage Institutes",
    "View Analytics",
    "Approve Admissions",
    "Modify Fees",
    "Access Audit Logs",
];

const ROLES = ["Super Admin", "Institute Admin", "Principal", "HOD"];

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div className="flex flex-col">
                        <Breadcrumbs
                            separator={<ChevronRight size={12} />}
                            className="mb-1"
                        >
                            <Link
                                underline="hover"
                                color="inherit"
                                href="#"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                            >
                                Dashboard
                            </Link>
                            <Link
                                underline="hover"
                                color="inherit"
                                href="#"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
                            >
                                System
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Settings
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">
                            System Settings
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="text"
                            startIcon={<History size={16} />}
                            className="!text-slate-600 !normal-case !font-bold !text-xs"
                        >
                            Audit History
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RotateCcw size={16} />}
                            className="!border-slate-200 !text-slate-700 !rounded-xl !normal-case !font-bold !text-xs !px-4"
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Save size={16} />}
                            className="!bg-slate-900 !text-white !rounded-xl !normal-case !font-bold !text-xs !px-6 !shadow-none"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="px-8 border-t border-slate-100">
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            "& .MuiTabs-indicator": {
                                backgroundColor: "#0F172A",
                                height: 3,
                            },
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 800,
                                fontSize: "13px",
                                color: "#64748B",
                                minHeight: "48px",
                                "&.Mui-selected": { color: "#0F172A" },
                            },
                        }}
                    >
                        <Tab
                            icon={<SettingsIcon size={16} />}
                            iconPosition="start"
                            label="General"
                        />
                        <Tab
                            icon={<ShieldCheck size={16} />}
                            iconPosition="start"
                            label="Security"
                        />
                        <Tab
                            icon={<Users size={16} />}
                            iconPosition="start"
                            label="Roles & Permissions"
                        />
                        <Tab
                            icon={<Server size={16} />}
                            iconPosition="start"
                            label="Configuration"
                        />
                        <Tab
                            icon={<Bell size={16} />}
                            iconPosition="start"
                            label="Notifications"
                        />
                    </Tabs>
                </div>
            </header>

            <div className="p-8 max-w-[1200px] mx-auto pb-24">
                {activeTab === 0 && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                    General Configuration
                                </h3>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Platform Name
                                        </label>
                                        <TextField
                                            fullWidth
                                            placeholder="EduERP Enterprise"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Default Language
                                        </label>
                                        <TextField
                                            select
                                            fullWidth
                                            defaultValue="English"
                                            size="small"
                                        >
                                            <MenuItem value="English">
                                                English (US)
                                            </MenuItem>
                                            <MenuItem value="Spanish">
                                                Spanish
                                            </MenuItem>
                                            <MenuItem value="French">
                                                French
                                            </MenuItem>
                                        </TextField>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Branding Logo
                                        </label>
                                        <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                                            <UploadCloud
                                                size={24}
                                                className="text-slate-400 mb-2"
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 text-center px-4">
                                                Click to upload logo (SVG/PNG)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Theme Accent Color
                                        </label>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {[
                                                "#0F172A",
                                                "#2563EB",
                                                "#7C3AED",
                                                "#DB2777",
                                                "#059669",
                                                "#F59E0B",
                                            ].map((color) => (
                                                <button
                                                    key={color}
                                                    className="w-10 h-10 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-200"
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            ))}
                                            <button className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                                                <Plus
                                                    size={16}
                                                    className="text-slate-400"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900">
                                            System Maintenance Mode
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                            Redirects users to a maintenance
                                            page. Admins still have access.
                                        </p>
                                    </div>
                                    <Switch color="default" />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
                                <Lock size={16} className="text-slate-900" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                    Authentication Policy
                                </h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Minimum Password Length
                                    </label>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        defaultValue={12}
                                        size="small"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Session Timeout (Minutes)
                                    </label>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        defaultValue={60}
                                        size="small"
                                    />
                                </div>
                                <div className="col-span-full flex items-center justify-between py-3 border-t border-slate-50">
                                    <span className="text-xs font-bold text-slate-700">
                                        Require Password Complexity
                                        (Symbols/Mixed Case)
                                    </span>
                                    <Switch defaultChecked />
                                </div>
                                <div className="col-span-full flex items-center justify-between py-3 border-t border-slate-50">
                                    <span className="text-xs font-bold text-slate-700">
                                        Multi-Factor Authentication (MFA)
                                        Enforcement
                                    </span>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                    Access Control (IP Whitelist)
                                </h3>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex gap-2">
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. 192.168.1.1"
                                        size="small"
                                    />
                                    <Button
                                        variant="contained"
                                        className="!bg-slate-900 !text-white !rounded-lg !shadow-none !px-6"
                                    >
                                        Add IP
                                    </Button>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <span className="text-xs font-mono font-bold text-slate-600">
                                            127.0.0.1 (Localhost)
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">
                                            System Default
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 2 && (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                Permission Matrix
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Copy size={14} />}
                                    className="!text-[10px] !font-black !rounded-lg !border-slate-200"
                                >
                                    Clone Role
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Plus size={14} />}
                                    className="!bg-slate-900 !text-white !text-[10px] !font-black !rounded-lg"
                                >
                                    New Role
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">
                                            Module Permission
                                        </th>
                                        {ROLES.map((role) => (
                                            <th
                                                key={role}
                                                className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center"
                                            >
                                                {role}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {PERMISSIONS.map((perm) => (
                                        <tr
                                            key={perm}
                                            className="hover:bg-slate-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-700">
                                                    {perm}
                                                </span>
                                            </td>
                                            {ROLES.map((role) => (
                                                <td
                                                    key={role}
                                                    className="px-6 py-4 text-center"
                                                >
                                                    <Checkbox
                                                        defaultChecked={
                                                            role ===
                                                                "Super Admin" ||
                                                            (role ===
                                                                "Institute Admin" &&
                                                                !perm.includes(
                                                                    "Audit",
                                                                ))
                                                        }
                                                        disabled={
                                                            role ===
                                                            "Super Admin"
                                                        }
                                                        size="small"
                                                        sx={{
                                                            "&.Mui-disabled": {
                                                                color: "#0F172A",
                                                            },
                                                        }}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-amber-50 border-t border-amber-100 flex items-start gap-3">
                            <ShieldCheck
                                size={18}
                                className="text-amber-600 mt-0.5 shrink-0"
                            />
                            <p className="text-[11px] font-semibold text-amber-700 leading-relaxed">
                                <strong>Role Escalation Prevention:</strong>{" "}
                                Administrative roles cannot grant permissions
                                higher than their own clearance level.
                            </p>
                        </div>
                    </section>
                )}

                {activeTab === 4 && (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                Notification Engine
                            </h3>
                        </div>
                        <div className="p-8 space-y-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    SMTP Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextField
                                        fullWidth
                                        label="SMTP Host"
                                        defaultValue="smtp.platform.com"
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="SMTP Port"
                                        defaultValue="587"
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Sender Address"
                                        defaultValue="no-reply@eduerp.com"
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        label="SMTP Password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        size="small"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword,
                                                            )
                                                        }
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff size={16} />
                                                        ) : (
                                                            <Eye size={16} />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="contained"
                                    size="small"
                                    className="!bg-slate-100 !text-slate-900 !font-black !rounded-lg !shadow-none !mt-2"
                                >
                                    Send Test Email
                                </Button>
                            </div>

                            <Divider />

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Automated Alerts
                                </h4>
                                {[
                                    {
                                        title: "Security: Failed Logins",
                                        desc: "Notify Super Admin on 5+ failures within 10 mins.",
                                        roles: ["Super Admin"],
                                    },
                                    {
                                        title: "System: New Registration",
                                        desc: "Notify on new Institute creation.",
                                        roles: [
                                            "Super Admin",
                                            "Institute Admin",
                                        ],
                                    },
                                    {
                                        title: "Billing: Payment Failure",
                                        desc: "Notify when an institute payment fails.",
                                        roles: ["Super Admin"],
                                    },
                                ].map((rule, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black text-slate-900">
                                                {rule.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                {rule.desc}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                {rule.roles.map((role) => (
                                                    <Tooltip
                                                        key={role}
                                                        title={role}
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                fontSize:
                                                                    "10px",
                                                                bgcolor:
                                                                    "slate.900",
                                                                border: "2px solid white",
                                                                fontWeight: 900,
                                                            }}
                                                        >
                                                            {role.charAt(0)}
                                                        </Avatar>
                                                    </Tooltip>
                                                ))}
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Settings;
