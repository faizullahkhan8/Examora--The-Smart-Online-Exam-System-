import { useState } from "react";
import {
    Breadcrumbs, Link, Typography, Button, TextField, Skeleton, Alert,
} from "@mui/material";
import { ChevronRight, Building2, Pencil, Save, X, Info } from "lucide-react";
import {
    useGetMyInstituteQuery,
    useUpdateMyInstituteMutation,
} from "../../services/institute/institute.service";

// ─── Placeholder used when no institute is linked yet ────────────────────────
const PLACEHOLDER_INSTITUTE = {
    _id: "",
    name: "Your Institute Name",
    domain: "institute.edu",
    type: "university" as const,
    establishedYear: new Date().getFullYear(),
    logoInitials: "IN",
    contactPhone: "+1 000 000 0000",
    contactEmail: "contact@institute.edu",
    website: "https://institute.edu",
    location: { address: "123 Campus Road", city: "City", country: "Country" },
    studentsCount: 0,
    departmentsCount: 0,
    isActive: true,
    principal: null,
    createdAt: "",
    updatedAt: "",
};

// ─── Field component ─────────────────────────────────────────────────────────
const Field = ({
    label, value, editing, name, onChange,
}: {
    label: string; value: string; editing: boolean; name: string;
    onChange: (name: string, val: string) => void;
}) => (
    <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        {editing ? (
            <TextField fullWidth size="small" value={value}
                onChange={(e) => onChange(name, e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "14px" } }} />
        ) : (
            <p className="text-sm font-bold text-slate-900">{value || "—"}</p>
        )}
    </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const InstituteProfile = () => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({});
    const [saveError, setSaveError] = useState("");

    const { data, isLoading, isError } = useGetMyInstituteQuery();
    const [updateMyInstitute, { isLoading: saving }] = useUpdateMyInstituteMutation();

    // If API returns 404 (no institute linked), fall back to placeholder so the
    // page is never blank — user sees clearly labelled placeholder data.
    const isPlaceholder = isError || !data?.data;
    const institute = data?.data ?? PLACEHOLDER_INSTITUTE;

    const onChange = (name: string, val: string) => setForm((p) => ({ ...p, [name]: val }));

    const handleEdit = () => {
        setForm({
            name: institute.name,
            domain: institute.domain,
            contactPhone: institute.contactPhone ?? "",
            contactEmail: institute.contactEmail ?? "",
            website: institute.website ?? "",
            address: institute.location?.address ?? "",
            city: institute.location?.city ?? "",
            country: institute.location?.country ?? "",
        });
        setSaveError("");
        setEditing(true);
    };

    const handleSave = async () => {
        if (isPlaceholder) {
            setSaveError("No institute is linked to your account yet. Ask the Admin to assign one.");
            return;
        }
        try {
            await updateMyInstitute({
                name: form.name,
                domain: form.domain,
                contactPhone: form.contactPhone,
                contactEmail: form.contactEmail,
                website: form.website,
            }).unwrap();
            setEditing(false);
        } catch (err: any) {
            setSaveError(err?.data?.message ?? "Failed to save changes.");
        }
    };

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
                                Institute Profile
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">Institute Profile</h1>
                    </div>
                    {!editing ? (
                        <Button variant="outlined" startIcon={<Pencil size={15} />} onClick={handleEdit}
                            className="!border-slate-200 !text-slate-600 !normal-case !font-bold !rounded-xl">
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outlined" startIcon={<X size={15} />}
                                onClick={() => { setEditing(false); setSaveError(""); }}
                                className="!border-slate-200 !text-slate-500 !normal-case !font-bold !rounded-xl">
                                Cancel
                            </Button>
                            <Button variant="contained" startIcon={<Save size={15} />}
                                onClick={handleSave} disabled={saving}
                                className="!bg-slate-900 !text-white !normal-case !font-bold !rounded-xl">
                                {saving ? "Saving…" : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            <main className="p-8 max-w-[800px] mx-auto space-y-6">
                {/* Placeholder banner */}
                {isPlaceholder && (
                    <Alert icon={<Info size={18} />} severity="info" className="rounded-xl">
                        No institute is linked to your account yet. The data shown below is placeholder.
                        Ask the <strong>Admin</strong> to assign your institute.
                    </Alert>
                )}

                {saveError && (
                    <Alert severity="error" className="rounded-xl">{saveError}</Alert>
                )}

                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={60} className="rounded-xl" />)
                ) : (
                    <>
                        {/* Hero card */}
                        <div className={`rounded-2xl p-6 text-white flex items-center gap-5 ${isPlaceholder
                            ? "bg-gradient-to-r from-slate-400 to-slate-500"
                            : "bg-gradient-to-r from-slate-900 to-slate-700"
                            }`}>
                            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-2xl font-black">
                                {institute.logoInitials}
                            </div>
                            <div>
                                <h2 className="text-xl font-black">{institute.name}</h2>
                                <p className="text-white/60 text-sm capitalize">
                                    {institute.type} · Est. {institute.establishedYear ?? "—"}
                                    {isPlaceholder && " · (placeholder)"}
                                </p>
                            </div>
                        </div>

                        {/* Basic info */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Institute Name" value={editing ? form.name : institute.name} editing={editing} name="name" onChange={onChange} />
                                <Field label="Domain" value={editing ? form.domain : institute.domain} editing={editing} name="domain" onChange={onChange} />
                                <Field label="Contact Phone" value={editing ? form.contactPhone : (institute.contactPhone ?? "")} editing={editing} name="contactPhone" onChange={onChange} />
                                <Field label="Contact Email" value={editing ? form.contactEmail : (institute.contactEmail ?? "")} editing={editing} name="contactEmail" onChange={onChange} />
                                <Field label="Website" value={editing ? form.website : (institute.website ?? "")} editing={editing} name="website" onChange={onChange} />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">
                                Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <Field label="Address" value={editing ? form.address : (institute.location?.address ?? "")} editing={editing} name="address" onChange={onChange} />
                                <Field label="City" value={editing ? form.city : (institute.location?.city ?? "")} editing={editing} name="city" onChange={onChange} />
                                <Field label="Country" value={editing ? form.country : (institute.location?.country ?? "")} editing={editing} name="country" onChange={onChange} />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center">
                                <p className="text-3xl font-black text-indigo-600">{institute.studentsCount ?? 0}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Total Students</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center">
                                <p className="text-3xl font-black text-blue-600">{institute.departmentsCount ?? 0}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Departments</p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default InstituteProfile;
