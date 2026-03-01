import { useState } from "react";
import {
    Paper, Button, Chip, TextField, MenuItem, Select, InputLabel, FormControl,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { Plus, Trash2, Link as LinkIcon, FileText, AlignLeft, BookMarked } from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useGetMySubjectsQuery } from "../../services/teacher/teacher.service";
import {
    useGetMaterialsBySubjectQuery,
    useCreateMaterialMutation,
    useDeleteMaterialMutation,
} from "../../services/material/material.service";

const typeIcon: Record<string, React.ReactNode> = {
    pdf: <FileText size={18} className="text-rose-600" />,
    link: <LinkIcon size={18} className="text-blue-600" />,
    note: <AlignLeft size={18} className="text-amber-600" />,
};

const typeCls: Record<string, string> = {
    pdf: "!bg-rose-50 !text-rose-700 !border-rose-200",
    link: "!bg-blue-50 !text-blue-700 !border-blue-200",
    note: "!bg-amber-50 !text-amber-700 !border-amber-200",
};

const MaterialsPage = () => {
    const [searchParams] = useSearchParams();
    const preSelected = searchParams.get("subject") ?? "";
    const { data: subjectsData } = useGetMySubjectsQuery();
    const [selectedSubject, setSelectedSubject] = useState(preSelected);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ title: "", type: "link" as "pdf" | "link" | "note", content: "" });

    const { data, isLoading, refetch } = useGetMaterialsBySubjectQuery(selectedSubject, { skip: !selectedSubject });
    const [create, { isLoading: creating }] = useCreateMaterialMutation();
    const [del, { isLoading: deleting }] = useDeleteMaterialMutation();

    const subjects = subjectsData?.data ?? [];
    const materials = data?.data ?? [];

    const handleCreate = async () => {
        if (!selectedSubject || !form.title || !form.content) return toast.error("All fields are required");
        try {
            await create({ subjectId: selectedSubject, ...form }).unwrap();
            toast.success("Material shared");
            setDialog(false);
            setForm({ title: "", type: "link", content: "" });
        } catch (e: any) {
            toast.error(e?.data?.error ?? "Failed to share material");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await del(id).unwrap();
            toast.success("Material removed");
        } catch (e: any) {
            toast.error(e?.data?.error ?? "Failed to delete");
        }
    };

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 mb-1">Course Materials</h1>
                    <p className="text-sm font-medium text-slate-500">Share notes, links, and PDFs with students</p>
                </div>
                <Button variant="contained" startIcon={<Plus size={16} />}
                    onClick={() => setDialog(true)} disabled={!selectedSubject}
                    className="!bg-slate-900 !text-white !rounded-xl !font-bold !normal-case !shadow-none disabled:opacity-50">
                    Share Material
                </Button>
            </div>

            {/* Subject selector */}
            <FormControl size="small" sx={{ minWidth: 280, mb: 4 }}>
                <InputLabel>Select Subject</InputLabel>
                <Select label="Select Subject" value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}>
                    {subjects.map((s: any) => (
                        <MenuItem key={s._id} value={s._id}>{s.name} (Sem {s.semester})</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {!selectedSubject ? (
                <Paper elevation={0} className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <BookMarked size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="font-black text-slate-500">Select a subject to view materials</h3>
                </Paper>
            ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-36 bg-slate-100 rounded-2xl" />)}
                </div>
            ) : materials.length === 0 ? (
                <Paper elevation={0} className="p-12 text-center border border-slate-200 rounded-2xl text-slate-400">
                    <BookMarked size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No materials shared yet</p>
                </Paper>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map((m: any) => (
                        <Paper key={m._id} elevation={0} className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {typeIcon[m.type]}
                                    <Chip label={m.type.toUpperCase()} size="small"
                                        className={`!text-[10px] !font-black border ${typeCls[m.type]}`} />
                                </div>
                                <button onClick={() => handleDelete(m._id)} disabled={deleting}
                                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <h3 className="font-black text-slate-900 mb-2">{m.title}</h3>
                            {m.type === "note" ? (
                                <p className="text-sm text-slate-500 line-clamp-3">{m.content}</p>
                            ) : (
                                <a href={m.content} target="_blank" rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 font-semibold hover:underline break-all line-clamp-2">
                                    {m.content}
                                </a>
                            )}
                            <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-widest">
                                {new Date(m.createdAt).toLocaleDateString()}
                            </p>
                        </Paper>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
                PaperProps={{ className: "rounded-2xl p-2" }}>
                <DialogTitle className="font-black text-slate-900">Share Material</DialogTitle>
                <DialogContent className="space-y-4 pt-2">
                    <TextField fullWidth size="small" label="Title" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                            <MenuItem value="link">Link (URL)</MenuItem>
                            <MenuItem value="pdf">PDF (URL)</MenuItem>
                            <MenuItem value="note">Note (Text)</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField fullWidth size="small"
                        label={form.type === "note" ? "Note content" : "URL"}
                        multiline={form.type === "note"} rows={form.type === "note" ? 4 : 1}
                        value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                </DialogContent>
                <DialogActions className="px-6 pb-4">
                    <Button onClick={() => setDialog(false)} className="!text-slate-500 !font-bold">Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating} variant="contained"
                        className="!bg-slate-900 !rounded-xl !font-bold !normal-case">
                        {creating ? "Sharing…" : "Share"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MaterialsPage;
