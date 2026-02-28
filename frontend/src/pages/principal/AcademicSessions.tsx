import { Breadcrumbs, Link, Typography, Chip, Button } from "@mui/material";
import { ChevronRight, CalendarDays, BookOpen, Lock, Unlock, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

// Demo session data — replace with API when sessions feature is built
const DEMO_SESSIONS = [
    { id: "1", name: "2024–25 Academic Year", startDate: "2024-09-01", endDate: "2025-06-30", semester: "Fall + Spring", studentsCount: 1240, isLocked: false, isActive: true },
    { id: "2", name: "2023–24 Academic Year", startDate: "2023-09-01", endDate: "2024-06-30", semester: "Fall + Spring", studentsCount: 1180, isLocked: true, isActive: false },
    { id: "3", name: "2022–23 Academic Year", startDate: "2022-09-01", endDate: "2023-06-30", semester: "Fall + Spring", studentsCount: 1050, isLocked: true, isActive: false },
];

const AcademicSessions = () => {
    const [sessions, setSessions] = useState(DEMO_SESSIONS);

    const toggleLock = (id: string) => {
        setSessions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, isLocked: !s.isLocked } : s)),
        );
    };

    return (
        <div className="flex-grow bg-[#F8FAFC] min-h-screen font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="h-20 px-8 flex items-center justify-between">
                    <div>
                        <Breadcrumbs separator={<ChevronRight size={12} />} className="mb-1">
                            <Link underline="hover" href="/principal/dashboard"
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Principal
                            </Link>
                            <Typography className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                                Academic Sessions
                            </Typography>
                        </Breadcrumbs>
                        <h1 className="text-xl font-black text-slate-900">Academic Sessions</h1>
                    </div>
                    <Button variant="contained" startIcon={<CalendarDays size={16} />}
                        className="!bg-slate-900 !text-white !normal-case !font-black !text-xs !rounded-xl !shadow-none">
                        Approve New Intake
                    </Button>
                </div>
            </header>

            <main className="p-8 space-y-4 max-w-[900px] mx-auto">
                {/* Info banner */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 font-semibold">
                    ℹ️ Session locking prevents any edits to that academic year. Student promotions are handled automatically.
                </div>

                {sessions.map((session) => (
                    <div key={session.id}
                        className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-4 ${session.isActive ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-100"
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="font-black text-slate-900">{session.name}</h2>
                                    {session.isActive && (
                                        <Chip label="Current" size="small"
                                            className="!bg-indigo-50 !text-indigo-700 !text-[10px] !font-black !uppercase" />
                                    )}
                                    {session.isLocked && (
                                        <Chip label="Locked" size="small"
                                            className="!bg-rose-50 !text-rose-600 !text-[10px] !font-black !uppercase" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 font-bold">
                                    {session.startDate} → {session.endDate} · {session.semester}
                                </p>
                            </div>

                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={session.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                                onClick={() => toggleLock(session.id)}
                                className={`!normal-case !font-bold !text-xs !rounded-xl ${session.isLocked
                                        ? "!border-emerald-200 !text-emerald-700"
                                        : "!border-rose-200 !text-rose-600"
                                    }`}
                            >
                                {session.isLocked ? "Unlock Session" : "Lock Session"}
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Students</span>
                                </div>
                                <p className="text-2xl font-black text-slate-900">{session.studentsCount.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpen size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester</span>
                                </div>
                                <p className="text-sm font-black text-slate-900">{session.semester}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                                </div>
                                <p className={`text-sm font-black ${session.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                                    {session.isActive ? "Ongoing" : "Completed"}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default AcademicSessions;
