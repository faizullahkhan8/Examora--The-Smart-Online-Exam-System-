import { useState } from "react";
import {
    Button, TextField, Skeleton, Alert,
} from "@mui/material";
import { Pencil, Save, X, Info, Building2, Globe, MapPin, Phone, Mail } from "lucide-react";
import {
    useGetMyInstituteQuery,
    useUpdateMyInstituteMutation,
} from "../../services/institute/institute.service";

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
    facultyCount: 0,
    isActive: true,
    principal: null,
    createdAt: "",
    updatedAt: "",
};

const Field = ({
    label, value, editing, name, onChange, icon: Icon
}: {
    label: string; value: string; editing: boolean; name: string;
    onChange: (name: string, val: string) => void;
    icon?: any;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-(--text-secondary) flex items-center gap-1.5">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        {editing ? (
            <TextField
                fullWidth
                size="small"
                value={value}
                onChange={(e) => onChange(name, e.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        backgroundColor: "var(--bg-base)",
                        color: "var(--text-primary)",
                        "& fieldset": { borderColor: "var(--ui-border)" },
                        "&:hover fieldset": { borderColor: "var(--brand-primary)" },
                        "&.Mui-focused fieldset": { borderColor: "var(--brand-primary)" },
                    },
                    "& .MuiInputBase-input::placeholder": {
                        color: "var(--text-secondary)",
                        opacity: 0.6,
                    }
                }}
            />
        ) : (
            <div className="py-2 px-3 bg-[var(--bg-base)] border border-(--ui-border) rounded-lg min-h-[38px] flex items-center">
                <p className="text-sm font-bold text-(--text-primary)">{value || "—"}</p>
            </div>
        )}
    </div>
);

const InstituteProfile = () => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({});
    const [saveError, setSaveError] = useState("");

    const { data, isLoading, isError } = useGetMyInstituteQuery();
    const [updateMyInstitute, { isLoading: saving }] = useUpdateMyInstituteMutation();

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

    const buttonSx = {
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
    };

    return (
        <div className="w-full bg-[var(--bg-base)] min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            Institute Profile
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Manage your institution's core details and identity.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {!editing ? (
                            <Button
                                variant="outlined"
                                startIcon={<Pencil size={16} />}
                                onClick={handleEdit}
                                sx={{
                                    ...buttonSx,
                                    borderColor: "var(--ui-border)",
                                    color: "var(--text-primary)",
                                    "&:hover": { borderColor: "var(--brand-primary)", bgcolor: "var(--brand-active)" }
                                }}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<X size={16} />}
                                    onClick={() => { setEditing(false); setSaveError(""); }}
                                    sx={{
                                        ...buttonSx,
                                        borderColor: "var(--ui-border)",
                                        color: "var(--text-secondary)",
                                        "&:hover": { borderColor: "var(--text-primary)", bgcolor: "var(--bg-surface)" }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Save size={16} />}
                                    onClick={handleSave}
                                    disabled={saving}
                                    sx={{
                                        ...buttonSx,
                                        bgcolor: "var(--brand-primary)",
                                        boxShadow: "none",
                                        "&:hover": { bgcolor: "var(--bg-sidebar)", boxShadow: "none" }
                                    }}
                                >
                                    {saving ? "Saving…" : "Save Changes"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {isPlaceholder && (
                        <Alert icon={<Info size={18} />} severity="info" sx={{ borderRadius: "12px", fontWeight: 600 }}>
                            No institute is linked to your account yet. The data shown below is placeholder.
                            Ask the <strong>Admin</strong> to assign your institute.
                        </Alert>
                    )}

                    {saveError && (
                        <Alert severity="error" sx={{ borderRadius: "12px", fontWeight: 600 }}>{saveError}</Alert>
                    )}

                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={80} sx={{ borderRadius: "16px", bgcolor: "var(--ui-divider)" }} variant="rectangular" className="mb-4" />)
                    ) : (
                        <>
                            <div className={`rounded-2xl p-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 ${isPlaceholder
                                ? "bg-(--bg-surface) border border-(--ui-border) text-(--text-primary)"
                                : "bg-(--bg-sidebar) text-(--text-on-dark)"
                                }`}>
                                {!isPlaceholder && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                )}
                                <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black shrink-0 relative z-10 ${isPlaceholder ? "bg-[var(--bg-base)] border border-(--ui-border) text-(--text-secondary)" : "bg-white/10 text-white shadow-sm"}`}>
                                    {institute.logoInitials}
                                </div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-black tracking-tight">{institute.name}</h2>
                                    <div className={`flex items-center gap-2 mt-1.5 text-sm font-semibold ${isPlaceholder ? "text-(--text-secondary)" : "text-white/70"}`}>
                                        <Building2 size={16} />
                                        <span className="capitalize">{institute.type}</span>
                                        <span>&bull;</span>
                                        <span>Est. {institute.establishedYear ?? "—"}</span>
                                        {isPlaceholder && <span className="uppercase tracking-wider text-[10px] ml-2 border border-current px-1.5 py-0.5 rounded opacity-60">Placeholder</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm text-center flex flex-col justify-center items-center gap-1">
                                    <p className="text-4xl font-black text-(--brand-primary)">{institute.studentsCount ?? 0}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-(--text-secondary)">Total Students</p>
                                </div>
                                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm text-center flex flex-col justify-center items-center gap-1">
                                    <p className="text-4xl font-black text-(--text-primary)">{institute.departmentsCount ?? 0}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-(--text-secondary)">Departments</p>
                                </div>
                                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm text-center flex flex-col justify-center items-center gap-1">
                                    <p className="text-4xl font-black text-(--text-primary)">{institute.facultyCount ?? 0}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-(--text-secondary)">Faculty Members</p>
                                </div>
                            </div>

                            <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm">
                                <h3 className="text-sm font-black text-(--text-primary) border-b border-(--ui-divider) pb-4 mb-5 flex items-center gap-2">
                                    <Globe size={18} className="text-(--text-secondary)" /> General Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Institute Name" value={editing ? form.name : institute.name} editing={editing} name="name" onChange={onChange} />
                                    <Field label="Primary Domain" value={editing ? form.domain : institute.domain} editing={editing} name="domain" onChange={onChange} />
                                    <Field label="Contact Phone" value={editing ? form.contactPhone : (institute.contactPhone ?? "")} editing={editing} name="contactPhone" onChange={onChange} icon={Phone} />
                                    <Field label="Contact Email" value={editing ? form.contactEmail : (institute.contactEmail ?? "")} editing={editing} name="contactEmail" onChange={onChange} icon={Mail} />
                                    <div className="md:col-span-2">
                                        <Field label="Website URL" value={editing ? form.website : (institute.website ?? "")} editing={editing} name="website" onChange={onChange} icon={Globe} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) p-6 shadow-sm">
                                <h3 className="text-sm font-black text-(--text-primary) border-b border-(--ui-divider) pb-4 mb-5 flex items-center gap-2">
                                    <MapPin size={18} className="text-(--text-secondary)" /> Geographic Location
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-3">
                                        <Field label="Street Address" value={editing ? form.address : (institute.location?.address ?? "")} editing={editing} name="address" onChange={onChange} />
                                    </div>
                                    <Field label="City" value={editing ? form.city : (institute.location?.city ?? "")} editing={editing} name="city" onChange={onChange} />
                                    <Field label="Country" value={editing ? form.country : (institute.location?.country ?? "")} editing={editing} name="country" onChange={onChange} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstituteProfile;