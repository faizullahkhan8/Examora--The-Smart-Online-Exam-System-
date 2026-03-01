import { useState } from "react";
import { Typography, Button, Paper, Drawer, TextField, Chip } from "@mui/material";
import { Plus, Search, ShieldBan, CheckCircle, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
    useGetFacultyByDeptQuery,
    useCreateFacultyMutation,
    useToggleFacultyStatusMutation,
    type FacultyMember,
} from "../../services/hod/hod.service";

const EMPTY_FORM = { firstName: "", lastName: "", email: "", password: "" };

const FacultyManagement = () => {
    const { data, isLoading } = useGetFacultyByDeptQuery();
    const [createFaculty, { isLoading: busy }] = useCreateFacultyMutation();
    const [toggleStatus] = useToggleFacultyStatusMutation();

    const faculty = data?.data ?? [];
    const [search, setSearch] = useState("");
    const [drawerOpen, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const filtered = faculty.filter(f =>
        `${f.firstName} ${f.lastName} ${f.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createFaculty(form).unwrap();
            toast.success("Faculty member added successfully");
            setOpen(false);
            setForm(EMPTY_FORM);
        } catch (err: any) {
            toast.error(err?.data?.message ?? "Failed to create faculty");
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            await toggleStatus(id).unwrap();
            toast.success(`Faculty ${isActive ? "suspended" : "activated"}`);
        } catch (err: any) {
            toast.error(err?.data?.message ?? "Action failed");
        }
    };

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 mb-1">Faculty Management</h1>
                    <p className="text-sm font-medium text-slate-500">Manage teachers in your department</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search faculty…"
                            className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm w-60 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                        />
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setOpen(true)}
                        className="!bg-slate-900 !text-white !font-bold !rounded-xl !px-6 !py-2.5 !normal-case hover:!bg-slate-800"
                    >
                        Add Faculty
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Paper elevation={0} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {isLoading ? (
                    <div className="p-12 space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={28} className="text-slate-300" />
                        </div>
                        <h3 className="font-black text-slate-700 mb-1">No faculty found</h3>
                        <p className="text-sm text-slate-400 font-medium">
                            {search ? "Try a different search term." : "Add your first faculty member above."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {["Name", "Email", "Status", "Actions"].map(h => (
                                        <th key={h} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t: FacultyMember) => (
                                    <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{t.firstName} {t.lastName}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{t.email}</td>
                                        <td className="px-6 py-4">
                                            <Chip
                                                label={t.isActive ? "Active" : "Suspended"}
                                                size="small"
                                                className={`!text-[10px] !font-black !uppercase !tracking-widest border ${t.isActive
                                                        ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200"
                                                        : "!bg-rose-50 !text-rose-700 !border-rose-200"
                                                    }`}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="small"
                                                variant="text"
                                                onClick={() => handleToggle(t._id, t.isActive)}
                                                startIcon={t.isActive ? <ShieldBan size={14} /> : <CheckCircle size={14} />}
                                                className={`!font-black !text-[10px] !uppercase !tracking-widest !rounded-lg ${t.isActive
                                                        ? "!text-rose-600 hover:!bg-rose-50"
                                                        : "!text-emerald-600 hover:!bg-emerald-50"
                                                    }`}
                                            >
                                                {t.isActive ? "Suspend" : "Activate"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Paper>

            {/* Create Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => !busy && setOpen(false)}
                PaperProps={{ className: "w-full max-w-md p-8 bg-[#F8FAFC]" }}
            >
                <h2 className="text-xl font-black text-slate-900 mb-1">Add Faculty Member</h2>
                <p className="text-sm text-slate-500 mb-8">Account will be scoped to your department automatically.</p>

                <form onSubmit={handleCreate} className="space-y-5">
                    <div className="flex gap-4">
                        <TextField
                            label="First Name" fullWidth required value={form.firstName} disabled={busy}
                            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: "12px" } }}
                        />
                        <TextField
                            label="Last Name" fullWidth required value={form.lastName} disabled={busy}
                            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: "12px" } }}
                        />
                    </div>
                    <TextField
                        label="Email Address" type="email" fullWidth required value={form.email} disabled={busy}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: "12px" } }}
                    />
                    <TextField
                        label="Temporary Password" type="password" fullWidth required
                        value={form.password} disabled={busy} inputProps={{ minLength: 6 }}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white", borderRadius: "12px" } }}
                    />
                    <div className="pt-4 flex gap-3">
                        <Button
                            fullWidth variant="outlined" disabled={busy}
                            onClick={() => setOpen(false)}
                            className="!rounded-xl !border-slate-300 !text-slate-700 !font-bold hover:!bg-slate-100 !normal-case"
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth type="submit" variant="contained" disabled={busy}
                            className="!rounded-xl !bg-slate-900 hover:!bg-slate-800 !text-white !font-bold !normal-case"
                        >
                            {busy ? "Adding…" : "Add Faculty"}
                        </Button>
                    </div>
                </form>
            </Drawer>
        </div>
    );
};

export default FacultyManagement;
