import { useState, useEffect, useCallback, useRef } from "react";
import {
    Button, TextField, MenuItem, Select, InputLabel, FormControl,
    Chip, Tooltip, CircularProgress, Divider,
} from "@mui/material";
import {
    Plus, Trash2, Save, Send, Eye, EyeOff, ChevronDown, ChevronUp,
    GripVertical, CheckCircle, AlertTriangle, XCircle, ArrowLeft,
    FileText, List, LayoutList, AlignLeft, BookOpen, Printer,
    Clock, BarChart3, Radio, RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetMySubjectsQuery } from "../../services/teacher/teacher.service";
import {
    useCreateExamPaperMutation,
    useUpdateExamPaperMutation,
    useSubmitExamPaperMutation,
    useGetMyExamPapersQuery,
} from "../../services/examPaper/examPaper.service";

// ─── Types ────────────────────────────────────────────────────────────────────
type QType = "mcq" | "short" | "long" | "case";
type Difficulty = "easy" | "medium" | "hard";
type Bloom = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

interface MCQOption {
    text: string;
    isCorrect: boolean;
}

interface SubQuestion {
    text: string;
    marks: number;
}

interface Question {
    id: string;
    type: QType;
    text: string;
    marks: number;
    difficulty: Difficulty;
    bloom?: Bloom;
    options?: MCQOption[]; // MCQ
    wordLimit?: number;    // subjective
    subQuestions?: SubQuestion[]; // case study
}

interface Section {
    id: string;
    title: string;
    instructions: string;
    questions: Question[];
    collapsed: boolean;
}

interface PaperMeta {
    subjectId: string;
    title: string;
    examType: "mid" | "final" | "quiz" | "assignment";
    totalMarks: number;
    duration: number;
    instructions: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const defaultQ = (type: QType = "short"): Question => ({
    id: uid(),
    type,
    text: "",
    marks: type === "mcq" ? 2 : type === "short" ? 5 : type === "long" ? 10 : 20,
    difficulty: "medium",
    bloom: undefined,
    options: type === "mcq" ? [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
    ] : undefined,
    wordLimit: type === "short" || type === "long" ? 200 : undefined,
    subQuestions: type === "case" ? [{ text: "", marks: 5 }, { text: "", marks: 5 }] : undefined,
});

const defaultSection = (): Section => ({
    id: uid(),
    title: "Section A",
    instructions: "Attempt all questions.",
    questions: [defaultQ("short")],
    collapsed: false,
});

const diffColors: Record<Difficulty, string> = {
    easy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border border-amber-200",
    hard: "bg-rose-50 text-rose-700 border border-rose-200",
};

const qTypeColors: Record<QType, string> = {
    mcq: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    short: "bg-blue-50 text-blue-700 border border-blue-200",
    long: "bg-violet-50 text-violet-700 border border-violet-200",
    case: "bg-orange-50 text-orange-700 border border-orange-200",
};

const qTypeLabels: Record<QType, string> = { mcq: "MCQ", short: "Short", long: "Long", case: "Case Study" };

const bloomLabels: Record<Bloom, string> = {
    remember: "Remember", understand: "Understand", apply: "Apply",
    analyze: "Analyze", evaluate: "Evaluate", create: "Create",
};

// ─── Mini Doughnut Chart ──────────────────────────────────────────────────────
const DoughnutChart = ({ easy, medium, hard }: { easy: number; medium: number; hard: number }) => {
    const total = easy + medium + hard || 1;
    const ep = ((easy / total) * 100).toFixed(0);
    const mp = ((medium / total) * 100).toFixed(0);
    const hp = ((hard / total) * 100).toFixed(0);
    const r = 28;
    const circ = 2 * Math.PI * r;
    const eD = (easy / total) * circ;
    const mD = (medium / total) * circ;
    const hD = (hard / total) * circ;

    return (
        <div className="flex items-center gap-4">
            <svg width={72} height={72} viewBox="0 0 72 72">
                <circle cx={36} cy={36} r={r} fill="none" stroke="#e2e8f0" strokeWidth={10} />
                {/* Easy */}
                <circle cx={36} cy={36} r={r} fill="none" stroke="#10b981" strokeWidth={10}
                    strokeDasharray={`${eD} ${circ - eD}`} strokeDashoffset={circ / 4} />
                {/* Medium */}
                <circle cx={36} cy={36} r={r} fill="none" stroke="#f59e0b" strokeWidth={10}
                    strokeDasharray={`${mD} ${circ - mD}`} strokeDashoffset={circ / 4 - eD} />
                {/* Hard */}
                <circle cx={36} cy={36} r={r} fill="none" stroke="#ef4444" strokeWidth={10}
                    strokeDasharray={`${hD} ${circ - hD}`} strokeDashoffset={circ / 4 - eD - mD} />
                <text x={36} y={40} textAnchor="middle" fontSize={11} fontWeight="900" fill="#0f172a">{total}</text>
            </svg>
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Easy {ep}%
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Med {mp}%
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Hard {hp}%
                </div>
            </div>
        </div>
    );
};

// ─── MCQ Question Card ────────────────────────────────────────────────────────
const MCQCard = ({ q, idx, onChange, onDelete }: { q: Question; idx: number; onChange: (q: Question) => void; onDelete: () => void }) => {
    const setOpt = (i: number, field: "text" | "isCorrect", val: any) => {
        const opts = q.options!.map((o, j) =>
            field === "isCorrect" ? { ...o, isCorrect: j === i } : (j === i ? { ...o, [field]: val } : o)
        );
        onChange({ ...q, options: opts });
    };
    return (
        <div className="space-y-3">
            <TextField fullWidth size="small" label="Question text" multiline rows={2}
                value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
                placeholder="Type your MCQ question here…" />
            <div className="space-y-2">
                {q.options!.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <button onClick={() => setOpt(i, "isCorrect", true)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${opt.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                            {opt.isCorrect && <span className="w-2 h-2 bg-white rounded-full" />}
                        </button>
                        <TextField size="small" fullWidth placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            value={opt.text} onChange={e => setOpt(i, "text", e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { backgroundColor: opt.isCorrect ? "#f0fdf4" : "white" } }} />
                    </div>
                ))}
                {q.options!.length < 6 && (
                    <button onClick={() => onChange({ ...q, options: [...q.options!, { text: "", isCorrect: false }] })}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1">
                        <Plus size={11} /> Add option
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Subjective Card (short/long) ─────────────────────────────────────────────
const SubjectiveCard = ({ q, onChange }: { q: Question; onChange: (q: Question) => void }) => (
    <div className="space-y-3">
        <TextField fullWidth size="small" label="Question text" multiline rows={q.type === "long" ? 3 : 2}
            value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
            placeholder="Type your question here…" />
        <div className="flex items-center gap-3">
            <TextField size="small" label="Word limit (optional)" type="number"
                value={q.wordLimit ?? ""} sx={{ width: 160 }}
                onChange={e => onChange({ ...q, wordLimit: Number(e.target.value) || undefined })} />
        </div>
    </div>
);

// ─── Case Study Card ──────────────────────────────────────────────────────────
const CaseStudyCard = ({ q, onChange }: { q: Question; onChange: (q: Question) => void }) => {
    const setSub = (i: number, field: keyof SubQuestion, val: any) =>
        onChange({ ...q, subQuestions: q.subQuestions!.map((s, j) => j === i ? { ...s, [field]: val } : s) });
    const addSub = () => onChange({ ...q, subQuestions: [...q.subQuestions!, { text: "", marks: 5 }] });
    const removeSub = (i: number) => onChange({ ...q, subQuestions: q.subQuestions!.filter((_, j) => j !== i) });

    const subTotal = q.subQuestions!.reduce((a, s) => a + s.marks, 0);

    return (
        <div className="space-y-3">
            <TextField fullWidth size="small" label="Case scenario / passage" multiline rows={4}
                value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
                placeholder="Describe the case study scenario…" />
            <div className="border-l-2 border-orange-200 pl-4 space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Sub-questions ({subTotal} marks)</p>
                    <button onClick={addSub} className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        <Plus size={11} /> Add sub-q
                    </button>
                </div>
                {q.subQuestions!.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-black text-slate-400 mt-2.5 w-5 shrink-0">{String.fromCharCode(97 + i)})</span>
                        <TextField size="small" fullWidth placeholder="Sub-question text" value={s.text}
                            onChange={e => setSub(i, "text", e.target.value)} />
                        <TextField size="small" label="Marks" type="number" value={s.marks} sx={{ width: 80 }}
                            onChange={e => setSub(i, "marks", Number(e.target.value))} />
                        {q.subQuestions!.length > 1 && (
                            <button onClick={() => removeSub(i)} className="text-rose-400 hover:text-rose-600 mt-2">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Question Card ────────────────────────────────────────────────────────────
const QuestionCard = ({
    q, idx, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    q: Question; idx: number;
    onChange: (q: Question) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const actualMarks = q.type === "case" ? q.subQuestions!.reduce((a, s) => a + s.marks, 0) : q.marks;

    return (
        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col gap-0.5">
                    <button onClick={onMoveUp} disabled={isFirst} className="text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors">
                        <ChevronUp size={12} />
                    </button>
                    <button onClick={onMoveDown} disabled={isLast} className="text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors">
                        <ChevronDown size={12} />
                    </button>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">Q{idx + 1}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${qTypeColors[q.type]}`}>
                        {qTypeLabels[q.type]}
                    </span>
                    {q.text && <p className="text-xs text-slate-500 truncate">{q.text}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Difficulty */}
                    <select value={q.difficulty}
                        onChange={e => onChange({ ...q, difficulty: e.target.value as Difficulty })}
                        className={`text-[10px] font-black px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${diffColors[q.difficulty]}`}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    {/* Marks */}
                    {q.type !== "case" ? (
                        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                            <span className="text-[10px] font-black">{q.marks}M</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">
                            <span className="text-[10px] font-black">{actualMarks}M</span>
                        </div>
                    )}
                    <button onClick={() => setCollapsed(c => !c)} className="text-slate-400 hover:text-slate-700 transition-colors">
                        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <button onClick={onDelete} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Card Body */}
            {!collapsed && (
                <div className="p-4 space-y-3">
                    {/* Bloom Taxonomy Tag (optional) */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bloom's:</span>
                        <select value={q.bloom ?? ""}
                            onChange={e => onChange({ ...q, bloom: e.target.value as Bloom || undefined })}
                            className="text-[10px] font-semibold border border-slate-200 px-2 py-1 rounded-lg outline-none text-slate-600 bg-white">
                            <option value="">— Select —</option>
                            {(Object.entries(bloomLabels) as [Bloom, string][]).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        {q.type !== "case" && (
                            <div className="ml-auto flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-slate-400">MARKS</span>
                                <input type="number" min={0} value={q.marks}
                                    onChange={e => onChange({ ...q, marks: Number(e.target.value) })}
                                    className="w-14 text-center text-sm font-black border border-slate-200 rounded-lg py-0.5 outline-none focus:ring-2 focus:ring-indigo-300" />
                            </div>
                        )}
                    </div>

                    {q.type === "mcq" && <MCQCard q={q} idx={idx} onChange={onChange} onDelete={onDelete} />}
                    {(q.type === "short" || q.type === "long") && <SubjectiveCard q={q} onChange={onChange} />}
                    {q.type === "case" && <CaseStudyCard q={q} onChange={onChange} />}
                </div>
            )}
        </div>
    );
};

// ─── Section Panel ────────────────────────────────────────────────────────────
const SectionPanel = ({
    section, secIdx, totalSections, onChange, onDelete, onMoveUp, onMoveDown, isActive, onClick,
}: {
    section: Section; secIdx: number; totalSections: number;
    onChange: (s: Section) => void; onDelete: () => void;
    onMoveUp: () => void; onMoveDown: () => void;
    isActive: boolean; onClick: () => void;
}) => {
    const marks = section.questions.reduce((a, q) => {
        if (q.type === "case") return a + q.subQuestions!.reduce((b, s) => b + s.marks, 0);
        return a + q.marks;
    }, 0);

    return (
        <div onClick={onClick}
            className={`cursor-pointer rounded-xl border px-3 py-2.5 transition-all ${isActive ? "border-indigo-400 bg-indigo-50/60 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-indigo-500" : "bg-slate-300"}`} />
                    <span className="text-sm font-black text-slate-800">{section.title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={secIdx === 0}
                        className="text-slate-300 hover:text-slate-600 disabled:opacity-20 p-0.5"><ChevronUp size={12} /></button>
                    <button onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={secIdx === totalSections - 1}
                        className="text-slate-300 hover:text-slate-600 disabled:opacity-20 p-0.5"><ChevronDown size={12} /></button>
                    {totalSections > 1 && (
                        <button onClick={e => { e.stopPropagation(); onDelete(); }}
                            className="text-slate-200 hover:text-rose-500 p-0.5"><Trash2 size={11} /></button>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 mt-1.5 ml-4">
                <span className="text-[10px] font-bold text-slate-400">{section.questions.length} Qs</span>
                <span className="text-[10px] font-bold text-indigo-600">{marks} Marks</span>
            </div>
        </div>
    );
};

// ─── Preview Mode ─────────────────────────────────────────────────────────────
const PreviewMode = ({
    meta, sections, subjects, onBack, onSubmit, submitting,
}: {
    meta: PaperMeta; sections: Section[]; subjects: any[];
    onBack: () => void; onSubmit: () => void; submitting: boolean;
}) => {
    const subject = subjects.find(s => s._id === meta.subjectId);
    const totalAssigned = sections.reduce((a, sec) =>
        a + sec.questions.reduce((b, q) =>
            b + (q.type === "case" ? q.subQuestions!.reduce((c, s) => c + s.marks, 0) : q.marks), 0), 0);

    return (
        <div className="min-h-screen bg-white">
            {/* Preview Toolbar */}
            <div className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-bold">
                        <ArrowLeft size={15} /> Back to Builder
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-bold">
                        <Printer size={14} /> Print
                    </button>
                    <button onClick={onSubmit} disabled={submitting}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                        <Send size={14} /> {submitting ? "Submitting…" : "Submit for HOD Approval"}
                    </button>
                </div>
            </div>

            {/* Paper */}
            <div className="max-w-[800px] mx-auto p-12 print:p-8">
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        {subject?.department?.name ?? "Department"}
                    </p>
                    <h1 className="text-2xl font-black text-slate-900 mt-2">{meta.title}</h1>
                    <p className="text-base font-bold text-slate-600 mt-1">
                        {meta.examType === "mid" ? "Mid-Term Examination" : meta.examType === "final" ? "Final Examination" : meta.examType === "quiz" ? "Quiz" : "Assignment"}
                    </p>
                    <div className="flex justify-center gap-10 mt-4 text-sm font-semibold text-slate-600">
                        <span>Subject: <strong>{subject?.name ?? "—"}</strong></span>
                        <span>Total Marks: <strong>{totalAssigned}</strong></span>
                        <span>Duration: <strong>{meta.duration} min</strong></span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Date: ___________________</p>
                </div>

                {/* Instructions */}
                {meta.instructions && (
                    <div className="mb-8 bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">General Instructions</p>
                        <p className="text-sm text-slate-700">{meta.instructions}</p>
                    </div>
                )}

                {/* Sections */}
                {sections.map((sec, si) => (
                    <div key={sec.id} className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <h2 className="font-black text-slate-900">{sec.title}</h2>
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-sm font-bold text-slate-500">
                                ({sec.questions.reduce((a, q) => a + (q.type === "case" ? q.subQuestions!.reduce((b, s) => b + s.marks, 0) : q.marks), 0)} Marks)
                            </span>
                        </div>
                        {sec.instructions && <p className="text-sm italic text-slate-500 mb-4">{sec.instructions}</p>}
                        <div className="space-y-6">
                            {sec.questions.map((q, qi) => {
                                const qNum = sections.slice(0, si).reduce((a, s) => a + s.questions.length, 0) + qi + 1;
                                const marks = q.type === "case" ? q.subQuestions!.reduce((a, s) => a + s.marks, 0) : q.marks;
                                return (
                                    <div key={q.id}>
                                        <div className="flex items-start justify-between">
                                            <p className="text-sm font-semibold text-slate-800">
                                                <span className="font-black">Q{qNum}.</span> {q.text || <em className="text-slate-400">No question text</em>}
                                            </p>
                                            <span className="text-sm font-black text-slate-700 ml-4 shrink-0">[{marks} M]</span>
                                        </div>
                                        {q.type === "mcq" && (
                                            <div className="grid grid-cols-2 gap-1 mt-3 ml-5">
                                                {q.options!.map((o, i) => (
                                                    <p key={i} className="text-sm text-slate-600">
                                                        ({String.fromCharCode(97 + i)}) {o.text || <span className="text-slate-300">Option {i + 1}</span>}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {q.type === "case" && (
                                            <div className="mt-3 ml-5 space-y-2">
                                                {q.subQuestions!.map((s, i) => (
                                                    <p key={i} className="text-sm text-slate-700">
                                                        <span className="font-black">{String.fromCharCode(97 + i)})</span> {s.text || "..."} <span className="font-bold">[{s.marks}M]</span>
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                        {(q.type === "short" || q.type === "long") && (
                                            <div className={`mt-3 ml-5 border-b border-dashed border-slate-200 ${q.type === "long" ? "h-40" : "h-20"}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="text-center mt-16 text-slate-300 text-xs font-bold uppercase tracking-widest print:hidden">
                    ─── End of Paper ───
                </div>
            </div>
        </div>
    );
};

// ─── Main Builder Page ────────────────────────────────────────────────────────
const ExamPaperBuilder = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get("edit") ?? "";
    const initSubject = searchParams.get("subject") ?? "";

    const { data: subjectsData } = useGetMySubjectsQuery();
    const { data: papersData } = useGetMyExamPapersQuery();
    const [create, { isLoading: creating }] = useCreateExamPaperMutation();
    const [update, { isLoading: updating }] = useUpdateExamPaperMutation();
    const [submit, { isLoading: submitting }] = useSubmitExamPaperMutation();

    const subjects = subjectsData?.data ?? [];
    const isSaving = creating || updating;

    // ─── State: meta ──────────────────────────────────────────────────────────
    const [meta, setMeta] = useState<PaperMeta>({
        subjectId: initSubject,
        title: "",
        examType: "mid",
        totalMarks: 100,
        duration: 180,
        instructions: "Attempt ALL questions. Write legibly.",
    });

    // ─── State: sections ──────────────────────────────────────────────────────
    const [sections, setSections] = useState<Section[]>([defaultSection()]);
    const [activeSecId, setActiveSecId] = useState<string>("");

    // ─── State: UI modes ──────────────────────────────────────────────────────
    const [previewMode, setPreviewMode] = useState(false);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [paperId, setPaperId] = useState<string | null>(editId || null);

    // ─── Load existing paper on edit ──────────────────────────────────────────
    useEffect(() => {
        if (!editId || !papersData?.data) return;
        const paper = papersData.data.find(p => p._id === editId);
        if (!paper) return;
        setMeta({
            subjectId: typeof paper.subject === "object" ? paper.subject._id : paper.subject,
            title: paper.title,
            examType: "mid",
            totalMarks: paper.totalMarks,
            duration: paper.duration,
            instructions: "Attempt ALL questions.",
        });
        // Map questions to our richer Section structure (flatten into one section)
        const qs = (paper.questions ?? []).map((q: any) => ({
            id: uid(),
            type: q.type ?? "short",
            text: q.text ?? "",
            marks: q.marks ?? 5,
            difficulty: "medium" as Difficulty,
            options: q.options ?? (q.type === "mcq" ? [
                { text: "", isCorrect: false }, { text: "", isCorrect: false },
                { text: "", isCorrect: false }, { text: "", isCorrect: false },
            ] : undefined),
            subQuestions: q.type === "case" ? [{ text: "", marks: 5 }] : undefined,
        }));
        if (qs.length > 0) {
            setSections([{ id: uid(), title: "Section A", instructions: "Attempt all questions.", questions: qs, collapsed: false }]);
        }
    }, [editId, papersData]);

    // ─── Sync active section ──────────────────────────────────────────────────
    useEffect(() => {
        if (!activeSecId && sections.length > 0) setActiveSecId(sections[0].id);
    }, [sections]);

    // ─── Derived stats ────────────────────────────────────────────────────────
    const totalAssigned = sections.reduce((a, sec) =>
        a + sec.questions.reduce((b, q) =>
            b + (q.type === "case" ? q.subQuestions!.reduce((c, s) => c + s.marks, 0) : q.marks), 0), 0);

    const totalQuestions = sections.reduce((a, sec) => a + sec.questions.length, 0);

    const diffCounts = sections.flatMap(s => s.questions).reduce(
        (acc, q) => ({ ...acc, [q.difficulty]: (acc[q.difficulty] ?? 0) + 1 }),
        { easy: 0, medium: 0, hard: 0 } as Record<Difficulty, number>
    );

    const marksMismatch = totalAssigned !== meta.totalMarks;
    const hasEmptyQ = sections.some(s => s.questions.some(q => !q.text.trim()));
    const hasNoSubject = !meta.subjectId;
    const hasNoTitle = !meta.title.trim();
    const isValid = !marksMismatch && !hasEmptyQ && !hasNoSubject && !hasNoTitle;

    // ─── Section helpers ──────────────────────────────────────────────────────
    const updateSection = (id: string, changes: Partial<Section>) =>
        setSections(ss => ss.map(s => s.id === id ? { ...s, ...changes } : s));

    const addSection = () => {
        const s = { ...defaultSection(), title: `Section ${String.fromCharCode(65 + sections.length)}` };
        setSections(ss => [...ss, s]);
        setActiveSecId(s.id);
    };

    const deleteSection = (id: string) =>
        setSections(ss => { const f = ss.filter(s => s.id !== id); setActiveSecId(f[0]?.id ?? ""); return f; });

    const moveSec = (i: number, dir: -1 | 1) => {
        const ss = [...sections];
        [ss[i], ss[i + dir]] = [ss[i + dir], ss[i]];
        setSections(ss);
    };

    // ─── Question helpers ─────────────────────────────────────────────────────
    const addQuestion = (secId: string, type: QType) => {
        setSections(ss => ss.map(s =>
            s.id === secId ? { ...s, questions: [...s.questions, defaultQ(type)] } : s
        ));
    };

    const updateQuestion = (secId: string, qIdx: number, q: Question) =>
        setSections(ss => ss.map(s =>
            s.id === secId ? { ...s, questions: s.questions.map((qi, i) => i === qIdx ? q : qi) } : s
        ));

    const deleteQuestion = (secId: string, qIdx: number) =>
        setSections(ss => ss.map(s =>
            s.id === secId ? { ...s, questions: s.questions.filter((_, i) => i !== qIdx) } : s
        ));

    const moveQ = (secId: string, i: number, dir: -1 | 1) =>
        setSections(ss => ss.map(s => {
            if (s.id !== secId) return s;
            const qs = [...s.questions];
            [qs[i], qs[i + dir]] = [qs[i + dir], qs[i]];
            return { ...s, questions: qs };
        }));

    // ─── Flatten to API format ────────────────────────────────────────────────
    const toApiPayload = () => {
        const questions = sections.flatMap(sec =>
            sec.questions.map(q => ({
                text: q.text,
                marks: q.type === "case" ? q.subQuestions!.reduce((a, s) => a + s.marks, 0) : q.marks,
                type: q.type === "case" ? "long" : q.type,
                options: q.options?.map(o => o.text) ?? undefined,
            }))
        );
        return {
            subjectId: meta.subjectId,
            title: meta.title,
            totalMarks: meta.totalMarks,
            duration: meta.duration,
            questions,
        };
    };

    // ─── Save / Autosave ──────────────────────────────────────────────────────
    const handleSave = useCallback(async (silent = false) => {
        if (!meta.subjectId || !meta.title) {
            if (!silent) toast.error("Subject and title are required");
            return;
        }
        try {
            const payload = toApiPayload();
            if (paperId) {
                await update({ id: paperId, ...payload }).unwrap();
            } else {
                const res = await create(payload).unwrap();
                setPaperId((res.data as any)._id);
            }
            const now = new Date().toLocaleTimeString();
            setSavedAt(now);
            if (!silent) toast.success("Paper saved as draft");
        } catch (e: any) {
            if (!silent) toast.error(e?.data?.error ?? "Failed to save");
        }
    }, [meta, sections, paperId]);

    // Autosave every 10 seconds
    useEffect(() => {
        const t = setInterval(() => { if (meta.subjectId && meta.title) handleSave(true); }, 10000);
        return () => clearInterval(t);
    }, [handleSave]);

    // Keyboard shortcut: Ctrl+S
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); } };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [handleSave]);

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!isValid) { toast.error("Fix all validation issues before submitting"); return; }
        try {
            let id = paperId;
            if (!id) {
                const res = await create(toApiPayload()).unwrap();
                id = (res.data as any)._id;
                setPaperId(id);
            } else {
                await update({ id, ...toApiPayload() }).unwrap();
            }
            await submit(id!).unwrap();
            toast.success("Paper submitted for HOD review!");
            navigate("/teacher/exam-papers");
        } catch (e: any) {
            toast.error(e?.data?.error ?? "Failed to submit");
        }
    };

    // ─── Active section ───────────────────────────────────────────────────────
    const activeSec = sections.find(s => s.id === activeSecId) ?? sections[0];

    // ─── Preview mode ─────────────────────────────────────────────────────────
    if (previewMode) {
        return <PreviewMode meta={meta} sections={sections} subjects={subjects}
            onBack={() => setPreviewMode(false)} onSubmit={handleSubmit} submitting={submitting} />;
    }

    // ─── Builder Layout ───────────────────────────────────────────────────────
    return (
        <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
            {/* ── Top Progress Bar ── */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 shrink-0 z-40">
                <button onClick={() => navigate("/teacher/exam-papers")}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors">
                    <ArrowLeft size={15} /> Back
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        {[
                            { label: "Subject", done: !!meta.subjectId },
                            { label: "Title", done: !!meta.title },
                            { label: "Questions", done: totalQuestions > 0 },
                            { label: "Marks OK", done: !marksMismatch && totalAssigned > 0 },
                            { label: "No empty Qs", done: !hasEmptyQ && totalQuestions > 0 },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-1">
                                {i > 0 && <ChevronDown size={10} className="rotate-[-90deg] text-slate-300" />}
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${step.done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                    {step.done ? "✓" : (i + 1)} {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {savedAt && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <RefreshCw size={10} /> Saved {savedAt}
                        </span>
                    )}
                    <button onClick={() => handleSave()} disabled={isSaving}
                        className="flex items-center gap-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                        {isSaving ? <CircularProgress size={12} /> : <Save size={13} />}
                        {isSaving ? "Saving…" : "Save Draft"}
                    </button>
                    <button onClick={() => setPreviewMode(true)}
                        className="flex items-center gap-1.5 border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                        <Eye size={13} /> Preview
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || !isValid}
                        className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-slate-700 disabled:opacity-50">
                        <Send size={13} /> {submitting ? "Submitting…" : "Submit to HOD"}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ══════════════════════════════════════════════════════════════
                    LEFT SIDEBAR – Paper Structure Navigator
                ══════════════════════════════════════════════════════════════ */}
                <aside className="w-[240px] shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                    <div className="px-4 py-4 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Paper Structure</p>
                        <TextField size="small" fullWidth label="Paper Title" value={meta.title}
                            onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                            placeholder="e.g. Mid-Term Paper 2024" />
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sections</p>
                        {sections.map((sec, si) => (
                            <SectionPanel key={sec.id} section={sec} secIdx={si} totalSections={sections.length}
                                onChange={s => updateSection(s.id, s)} onDelete={() => deleteSection(sec.id)}
                                onMoveUp={() => moveSec(si, -1)} onMoveDown={() => moveSec(si, 1)}
                                isActive={sec.id === activeSecId} onClick={() => setActiveSecId(sec.id)} />
                        ))}
                        <button onClick={addSection}
                            className="w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 text-xs font-bold py-2.5 rounded-xl transition-colors mt-2">
                            <Plus size={13} /> Add Section
                        </button>
                    </div>

                    {/* Totals */}
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                            <span>{totalQuestions} questions</span>
                            <span className={`font-black ${marksMismatch && totalAssigned > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {totalAssigned}/{meta.totalMarks}M
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${marksMismatch && totalAssigned > 0 ? "bg-rose-500" : "bg-emerald-500"}`}
                                style={{ width: `${Math.min(100, (totalAssigned / meta.totalMarks) * 100)}%` }} />
                        </div>
                    </div>
                </aside>

                {/* ══════════════════════════════════════════════════════════════
                    CENTER CANVAS – Question Builder
                ══════════════════════════════════════════════════════════════ */}
                <main className="flex-1 overflow-y-auto p-6">
                    {activeSec ? (
                        <div className="max-w-[780px] mx-auto space-y-5">
                            {/* Section header */}
                            <div className="flex items-center gap-4 pb-1">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <TextField size="small" label="Section title" value={activeSec.title}
                                        onChange={e => updateSection(activeSec.id, { title: e.target.value })} />
                                    <TextField size="small" label="Section instructions" value={activeSec.instructions}
                                        onChange={e => updateSection(activeSec.id, { instructions: e.target.value })} />
                                </div>
                            </div>

                            {/* Questions */}
                            {activeSec.questions.length === 0 ? (
                                <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                    <LayoutList size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="font-black">No questions yet</p>
                                    <p className="text-sm mt-1">Use the buttons below to add your first question.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeSec.questions.map((q, qi) => (
                                        <QuestionCard key={q.id} q={q} idx={qi}
                                            onChange={nq => updateQuestion(activeSec.id, qi, nq)}
                                            onDelete={() => deleteQuestion(activeSec.id, qi)}
                                            onMoveUp={() => moveQ(activeSec.id, qi, -1)}
                                            onMoveDown={() => moveQ(activeSec.id, qi, 1)}
                                            isFirst={qi === 0} isLast={qi === activeSec.questions.length - 1} />
                                    ))}
                                </div>
                            )}

                            {/* Add question bar */}
                            <div className="sticky bottom-6 flex items-center justify-center">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg px-4 py-3 flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-400 mr-1">ADD</span>
                                    {(["mcq", "short", "long", "case"] as QType[]).map(type => (
                                        <button key={type} onClick={() => addQuestion(activeSec.id, type)}
                                            className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all hover:scale-105 ${qTypeColors[type]}`}>
                                            + {qTypeLabels[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-black">Select a section from the left panel</p>
                            </div>
                        </div>
                    )}
                </main>

                {/* ══════════════════════════════════════════════════════════════
                    RIGHT PANEL – Settings & Live Validation
                ══════════════════════════════════════════════════════════════ */}
                <aside className="w-[260px] shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
                    {/* Paper Metadata */}
                    <div className="px-4 py-4 space-y-3 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paper Settings</p>

                        <FormControl fullWidth size="small">
                            <InputLabel>Subject</InputLabel>
                            <Select label="Subject" value={meta.subjectId}
                                onChange={e => setMeta(m => ({ ...m, subjectId: e.target.value }))}>
                                {subjects.map((s: any) => (
                                    <MenuItem key={s._id} value={s._id}>{s.name} (Sem {s.semester})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Exam Type</InputLabel>
                            <Select label="Exam Type" value={meta.examType}
                                onChange={e => setMeta(m => ({ ...m, examType: e.target.value as any }))}>
                                <MenuItem value="mid">Mid-Term</MenuItem>
                                <MenuItem value="final">Final</MenuItem>
                                <MenuItem value="quiz">Quiz</MenuItem>
                                <MenuItem value="assignment">Assignment</MenuItem>
                            </Select>
                        </FormControl>

                        <div className="grid grid-cols-2 gap-2">
                            <TextField size="small" label="Total Marks" type="number" value={meta.totalMarks}
                                onChange={e => setMeta(m => ({ ...m, totalMarks: Number(e.target.value) }))} />
                            <TextField size="small" label="Duration (min)" type="number" value={meta.duration}
                                onChange={e => setMeta(m => ({ ...m, duration: Number(e.target.value) }))} />
                        </div>

                        <TextField size="small" fullWidth label="Instructions" multiline rows={2}
                            value={meta.instructions}
                            onChange={e => setMeta(m => ({ ...m, instructions: e.target.value }))} />
                    </div>

                    {/* Live Validation */}
                    <div className="px-4 py-4 border-b border-slate-100 space-y-2.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Validation</p>

                        {/* Marks bar */}
                        <div className="bg-slate-50 rounded-xl p-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold text-slate-600">Marks Assigned</span>
                                <span className={`font-black ${marksMismatch && totalAssigned > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                    {totalAssigned} / {meta.totalMarks}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${totalAssigned > meta.totalMarks ? "bg-rose-500" : totalAssigned === meta.totalMarks ? "bg-emerald-500" : "bg-amber-400"}`}
                                    style={{ width: `${Math.min(100, (totalAssigned / (meta.totalMarks || 1)) * 100)}%` }} />
                            </div>
                        </div>

                        {/* Checklist */}
                        {[
                            { label: "Subject selected", ok: !hasNoSubject },
                            { label: "Paper title set", ok: !hasNoTitle },
                            { label: "At least 1 question", ok: totalQuestions > 0 },
                            { label: "Marks match exactly", ok: !marksMismatch && totalAssigned > 0 },
                            { label: "No empty questions", ok: !hasEmptyQ && totalQuestions > 0 },
                        ].map(({ label, ok }) => (
                            <div key={label} className="flex items-center gap-2">
                                {ok
                                    ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                    : <XCircle size={14} className="text-rose-400 shrink-0" />}
                                <span className={`text-xs font-semibold ${ok ? "text-slate-600" : "text-rose-500"}`}>{label}</span>
                            </div>
                        ))}

                        {marksMismatch && totalAssigned > 0 && (
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-1">
                                <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-semibold text-amber-700">
                                    {totalAssigned > meta.totalMarks
                                        ? `Over by ${totalAssigned - meta.totalMarks} marks`
                                        : `Short by ${meta.totalMarks - totalAssigned} marks`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Difficulty Distribution */}
                    <div className="px-4 py-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Difficulty Mix</p>
                        <DoughnutChart easy={diffCounts.easy} medium={diffCounts.medium} hard={diffCounts.hard} />
                        <div className="mt-3 grid grid-cols-3 gap-1">
                            {([["easy", diffCounts.easy, "bg-emerald-100 text-emerald-800"], ["medium", diffCounts.medium, "bg-amber-100 text-amber-800"], ["hard", diffCounts.hard, "bg-rose-100 text-rose-800"]] as [string, number, string][]).map(([k, v, cls]) => (
                                <div key={k} className={`${cls} rounded-lg px-2 py-1.5 text-center`}>
                                    <p className="text-base font-black">{v}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-wider">{k}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ExamPaperBuilder;
