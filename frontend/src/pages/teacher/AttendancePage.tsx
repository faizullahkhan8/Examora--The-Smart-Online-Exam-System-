import { useState, useEffect } from "react";
import { Paper, Button, MenuItem, Select, InputLabel, FormControl, Chip } from "@mui/material";
import { CalendarCheck, Check, X, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useGetMySubjectsQuery, useGetSubjectStudentsQuery } from "../../services/teacher/teacher.service";
import { useMarkAttendanceMutation, useGetAttendanceBySubjectQuery } from "../../services/attendance/attendance.service";

// ─── Attendance Page ───────────────────────────────────────────────────────────
const AttendancePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const preSelected = searchParams.get("subject") ?? "";

    const { data: subjectsData } = useGetMySubjectsQuery();
    const [selectedSubject, setSelectedSubject] = useState(preSelected);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const { data: studentsData, isLoading: studentsLoading } = useGetSubjectStudentsQuery(selectedSubject, { skip: !selectedSubject });
    const { data: historyData } = useGetAttendanceBySubjectQuery(selectedSubject, { skip: !selectedSubject });
    const [mark, { isLoading: saving }] = useMarkAttendanceMutation();

    const subjects = subjectsData?.data ?? [];
    const students = studentsData?.data ?? [];

    // Initialise attendance map
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // When date changes find existing record; default all present
        if (students.length === 0) return;
        const existing = historyData?.data?.find(a =>
            new Date(a.date).toISOString().slice(0, 10) === date
        );
        if (existing) {
            const map: Record<string, boolean> = {};
            existing.records.forEach((r: any) => {
                map[typeof r.student === "object" ? r.student._id : r.student] = r.present;
            });
            setAttendance(map);
        } else {
            const map: Record<string, boolean> = {};
            students.forEach(s => { map[s._id] = true; });
            setAttendance(map);
        }
    }, [date, students, historyData]);

    const toggle = (id: string) => setAttendance(prev => ({ ...prev, [id]: !prev[id] }));

    const handleSave = async () => {
        if (!selectedSubject) return toast.error("Select a subject first");
        const records = students.map(s => ({ student: s._id, present: attendance[s._id] ?? true }));
        try {
            await mark({ subjectId: selectedSubject, date, records }).unwrap();
            toast.success("Attendance saved successfully");
        } catch (e: any) {
            toast.error(e?.data?.error ?? "Failed to save");
        }
    };

    const totalPresent = Object.values(attendance).filter(Boolean).length;

    return (
        <div className="p-8 pb-32 max-w-[1200px] mx-auto w-full font-sans">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-1">Attendance</h1>
                <p className="text-sm font-medium text-slate-500">Mark attendance for your classes</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
                <FormControl size="small" sx={{ minWidth: 250 }}>
                    <InputLabel>Select Subject</InputLabel>
                    <Select label="Select Subject" value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}>
                        {subjects.map((s: any) => (
                            <MenuItem key={s._id} value={s._id}>{s.name} (Sem {s.semester})</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <input type="date" value={date}
                    onChange={e => setDate(e.target.value)}
                    className="border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
            </div>

            {!selectedSubject ? (
                <Paper elevation={0} className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <CalendarCheck size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="font-black text-slate-500">Select a subject to get started</h3>
                </Paper>
            ) : studentsLoading ? (
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
                </div>
            ) : students.length === 0 ? (
                <Paper elevation={0} className="p-12 text-center border border-slate-200 rounded-2xl text-slate-400">
                    <p className="font-bold">No students found in this department.</p>
                </Paper>
            ) : (
                <>
                    {/* Summary bar */}
                    <div className="flex items-center gap-6 mb-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <CalendarCheck size={22} className="text-indigo-600" />
                        <div className="flex gap-6">
                            <div><span className="font-black text-indigo-900">{totalPresent}</span>
                                <span className="text-xs font-bold text-indigo-600 ml-1">present</span></div>
                            <div><span className="font-black text-rose-700">{students.length - totalPresent}</span>
                                <span className="text-xs font-bold text-rose-600 ml-1">absent</span></div>
                            <div><span className="font-black text-slate-700">{students.length}</span>
                                <span className="text-xs font-bold text-slate-500 ml-1">total</span></div>
                        </div>
                    </div>

                    <Paper elevation={0} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {["Student", "Email", "Status", "Toggle"].map(h => (
                                        <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s: any) => {
                                    const present = attendance[s._id] ?? true;
                                    return (
                                        <tr key={s._id} className={`border-b border-slate-100 transition-colors ${present ? "bg-white" : "bg-rose-50/30"}`}>
                                            <td className="px-6 py-4 font-bold text-slate-900">{s.firstName} {s.lastName}</td>
                                            <td className="px-6 py-4 text-slate-500">{s.email}</td>
                                            <td className="px-6 py-4">
                                                <Chip label={present ? "Present" : "Absent"} size="small"
                                                    className={`!text-[10px] !font-black !uppercase border ${present ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200" : "!bg-rose-50 !text-rose-700 !border-rose-200"}`} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggle(s._id)}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${present ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700" : "bg-rose-100 hover:bg-rose-200 text-rose-700"}`}>
                                                    {present ? <Check size={16} /> : <X size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Paper>

                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSave} disabled={saving} variant="contained"
                            startIcon={<Save size={16} />}
                            className="!bg-slate-900 !text-white !rounded-xl !font-bold !normal-case !shadow-none">
                            {saving ? "Saving…" : "Save Attendance"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AttendancePage;
