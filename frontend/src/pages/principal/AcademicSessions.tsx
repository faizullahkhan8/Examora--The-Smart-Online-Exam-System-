import { useState, useEffect } from "react";
import {
    Button,
    IconButton,
    Chip,
    Drawer,
    TextField,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
} from "@mui/material";
import {
    Plus,
    CalendarDays,
    Pencil,
    Lock,
    Unlock,
    DoorClosed,
    ArrowUpCircle,
    BookOpen,
} from "lucide-react";

import { useGetDepartmentsQuery } from "../../services/department/department.service";
import {
    useGetSessionsByDeptQuery,
    useCreateSessionMutation,
    useUpdateSessionMutation,
    useLockSessionMutation,
    useUnlockSessionMutation,
    useCloseEnrollmentMutation,
    useManualPromoteMutation,
    type AcademicSession,
} from "../../services/academicSession/academicSession.service";

const textFieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
        fontSize: "14px",
        fontWeight: 500,
        "& fieldset": { borderColor: "var(--ui-border)" },
        "&:hover fieldset": { borderColor: "var(--brand-primary)" },
        "&.Mui-focused fieldset": { borderColor: "var(--brand-primary)" },
    },
    "& .MuiInputLabel-root": {
        color: "var(--text-secondary)",
        fontSize: "14px",
        fontWeight: 600,
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-primary)" },
};

const buttonSx = {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 600,
};

const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
        case "active":
            return {
                label: "Active",
                className: "bg-emerald-50 text-emerald-600 border-emerald-100",
            };
        case "locked":
            return {
                label: "Locked",
                className: "bg-amber-50 text-amber-600 border-amber-100",
            };
        case "completed":
            return {
                label: "Completed",
                className:
                    "bg-(--bg-base) text-(--text-secondary) border-(--ui-border)",
            };
        case "upcoming":
        default:
            return {
                label: "Upcoming",
                className: "bg-blue-50 text-blue-600 border-blue-100",
            };
    }
};

const SessionDrawer = ({
    open,
    editing,
    selectedDept,
    onClose,
}: {
    open: boolean;
    editing?: AcademicSession | null;
    selectedDept: string;
    onClose: () => void;
}) => {
    const [startYear, setStartYear] = useState<number | "">(
        new Date().getFullYear(),
    );
    const [intakeCapacity, setIntakeCapacity] = useState<number | "">("");

    const [createSession, { isLoading: creating }] = useCreateSessionMutation();
    const [updateSession, { isLoading: updating }] = useUpdateSessionMutation();

    const isLoading = creating || updating;

    useEffect(() => {
        if (open) {
            if (editing) {
                setStartYear(editing.startYear);
                setIntakeCapacity(editing.intakeCapacity || "");
            } else {
                setStartYear(new Date().getFullYear());
                setIntakeCapacity("");
            }
        }
    }, [open, editing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDept) return;

        try {
            if (editing) {
                await updateSession({
                    deptId: selectedDept,
                    id: editing._id,
                    intakeCapacity: Number(intakeCapacity) || undefined,
                }).unwrap();
            } else {
                if (!startYear) return;
                await createSession({
                    deptId: selectedDept,
                    startYear: Number(startYear),
                    intakeCapacity: Number(intakeCapacity) || undefined,
                }).unwrap();
            }
            onClose();
        } catch (_) { }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 400,
                    p: 4,
                    bgcolor: "var(--bg-surface)",
                    borderLeft: "1px solid var(--ui-border)",
                },
            }}
        >
            <h2 className="text-xl font-black text-(--text-primary) tracking-tight mb-1">
                {editing ? "Update Capacity" : "New Academic Session"}
            </h2>
            <p className="text-xs text-(--text-secondary) font-medium mb-6">
                {editing
                    ? "Modify the intake capacity for this session."
                    : "Define a new academic year for the selected department."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <TextField
                    fullWidth
                    label="Start Year (e.g. 2026)"
                    type="number"
                    required
                    disabled={!!editing}
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    sx={textFieldSx}
                />

                <TextField
                    fullWidth
                    label="Intake Capacity (Optional)"
                    type="number"
                    value={intakeCapacity}
                    onChange={(e) => setIntakeCapacity(Number(e.target.value))}
                    sx={textFieldSx}
                />

                <div className="flex gap-3 pt-4 border-t border-(--ui-divider) mt-2">
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            ...buttonSx,
                            borderColor: "var(--ui-border)",
                            color: "var(--text-secondary)",
                            "&:hover": {
                                borderColor: "var(--text-primary)",
                                bgcolor: "var(--bg-base)",
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={isLoading || (!editing && !startYear)}
                        sx={{
                            ...buttonSx,
                            bgcolor: "var(--brand-primary)",
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: "var(--bg-sidebar)",
                                boxShadow: "none",
                            },
                        }}
                    >
                        {isLoading
                            ? "Saving…"
                            : editing
                                ? "Update Session"
                                : "Create Session"}
                    </Button>
                </div>
            </form>
        </Drawer>
    );
};

const PromoteDialog = ({
    open,
    session,
    selectedDept,
    onClose,
}: {
    open: boolean;
    session: AcademicSession | null;
    selectedDept: string;
    onClose: () => void;
}) => {
    const [reason, setReason] = useState("");
    const [manualPromote, { isLoading }] = useManualPromoteMutation();

    const handlePromote = async () => {
        if (!session || !selectedDept || !reason.trim()) return;
        try {
            await manualPromote({
                deptId: selectedDept,
                id: session._id,
                reason: reason.trim(),
            }).unwrap();
            onClose();
            setReason("");
        } catch (_) { }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                    border: "1px solid var(--ui-border)",
                    bgcolor: "var(--bg-surface)",
                    minWidth: 400,
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    px: 3,
                    pt: 3,
                    pb: 1,
                    fontSize: "1.125rem",
                }}
            >
                Manual Semester Promotion
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
                <p className="text-sm text-(--text-secondary) font-medium mb-4">
                    Advance the current semester for the{" "}
                    <strong>
                        {session?.startYear} - {session?.endYear}
                    </strong>{" "}
                    session. This will affect all enrolled students.
                </p>
                <TextField
                    fullWidth
                    label="Reason for Manual Promotion"
                    required
                    multiline
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    sx={textFieldSx}
                />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                        textTransform: "none",
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handlePromote}
                    disabled={isLoading || !reason.trim()}
                    variant="contained"
                    sx={{
                        ...buttonSx,
                        bgcolor: "var(--brand-primary)",
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: "var(--bg-sidebar)",
                            boxShadow: "none",
                        },
                    }}
                >
                    {isLoading ? "Promoting…" : "Confirm Promotion"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const AcademicSessions = () => {
    const [selectedDept, setSelectedDept] = useState<string>("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingSession, setEditingSession] =
        useState<AcademicSession | null>(null);
    const [promoteSession, setPromoteSession] =
        useState<AcademicSession | null>(null);

    const { data: deptData, isLoading: deptsLoading } =
        useGetDepartmentsQuery();
    const departments = deptData?.data ?? [];

    useEffect(() => {
        if (departments.length > 0 && !selectedDept) {
            setSelectedDept(departments[0]._id);
        }
    }, [departments, selectedDept]);

    const { data: sessionData, isLoading: sessionsLoading } =
        useGetSessionsByDeptQuery(
            { deptId: selectedDept, page: page + 1, limit: rowsPerPage },
            { skip: !selectedDept },
        );
    const sessions = sessionData?.data ?? [];
    const sessionPagination = sessionData?.pagination;

    const [lockSession] = useLockSessionMutation();
    const [unlockSession] = useUnlockSessionMutation();
    const [closeEnrollment] = useCloseEnrollmentMutation();

    const handleLockToggle = async (session: AcademicSession) => {
        if (!selectedDept) return;
        try {
            if (session.status === "locked") {
                await unlockSession({
                    deptId: selectedDept,
                    id: session._id,
                }).unwrap();
            } else {
                await lockSession({
                    deptId: selectedDept,
                    id: session._id,
                }).unwrap();
            }
        } catch (_) { }
    };

    const handleCloseEnrollment = async (session: AcademicSession) => {
        if (!selectedDept) return;
        try {
            await closeEnrollment({
                deptId: selectedDept,
                id: session._id,
            }).unwrap();
        } catch (_) { }
    };

    return (
        <div className="w-full bg-(--bg-base) min-h-screen font-sans pb-10">
            <div className="p-8 max-w-[1600px] mx-auto">
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-(--text-primary) tracking-tight">
                            Academic Sessions
                        </h1>
                        <p className="text-(--text-secondary) text-sm font-medium mt-1">
                            Configure institutional terms, capacities, and
                            enrollment states.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedDept}
                            onChange={(e) => {
                                setSelectedDept(e.target.value);
                                setPage(0);
                            }}
                            disabled={deptsLoading || departments.length === 0}
                            className="bg-(--bg-base) border border-(--ui-border) rounded-lg px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-(--brand-primary) focus:border-(--brand-primary) outline-none w-64 transition-all text-(--text-primary) disabled:opacity-60"
                        >
                            {deptsLoading ? (
                                <option value="">Loading Departments...</option>
                            ) : departments.length === 0 ? (
                                <option value="">No Departments Found</option>
                            ) : (
                                departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name} ({dept.code})
                                    </option>
                                ))
                            )}
                        </select>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={16} />}
                            disabled={!selectedDept}
                            onClick={() => {
                                setEditingSession(null);
                                setDrawerOpen(true);
                            }}
                            sx={{
                                ...buttonSx,
                                bgcolor: "var(--brand-primary)",
                                boxShadow: "none",
                                px: 3,
                                "&:hover": {
                                    bgcolor: "var(--bg-sidebar)",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            New Session
                        </Button>
                    </div>
                </div>

                <div className="bg-(--bg-surface) rounded-xl border border-(--ui-border) overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[420px]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-(--ui-divider) bg-(--bg-base) text-left">
                                    {[
                                        "Academic Year",
                                        "Semester",
                                        "Enrollment",
                                        "Capacity",
                                        "Status",
                                        "Actions",
                                    ].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-(--text-secondary) ${i === 5 ? "text-right" : ""}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--ui-divider)">
                                {!selectedDept ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center"
                                        >
                                            <BookOpen
                                                size={40}
                                                className="mx-auto text-(--text-secondary) opacity-30 mb-3"
                                            />
                                            <p className="font-bold text-(--text-primary) text-base">
                                                Select a Department
                                            </p>
                                            <p className="text-xs text-(--text-secondary) mt-1">
                                                Choose a department from the
                                                dropdown to view its sessions.
                                            </p>
                                        </td>
                                    </tr>
                                ) : sessionsLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr
                                            key={i}
                                            className="hover:bg-(--bg-base) transition-colors"
                                        >
                                            {Array.from({ length: 6 }).map(
                                                (_, j) => (
                                                    <td
                                                        key={j}
                                                        className="px-6 py-4"
                                                    >
                                                        <Skeleton
                                                            height={20}
                                                            sx={{
                                                                bgcolor:
                                                                    "var(--ui-divider)",
                                                                borderRadius:
                                                                    "4px",
                                                            }}
                                                        />
                                                    </td>
                                                ),
                                            )}
                                        </tr>
                                    ))
                                ) : sessions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center bg-(--bg-base)"
                                        >
                                            <CalendarDays
                                                size={48}
                                                className="mx-auto text-(--text-secondary) opacity-30 mb-4"
                                            />
                                            <p className="font-black text-(--text-primary) text-lg">
                                                No sessions configured
                                            </p>
                                            <p className="text-sm font-medium text-(--text-secondary) mt-1">
                                                Click "New Session" to
                                                initialize an academic year for
                                                this department.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session) => {
                                        const config = getStatusConfig(
                                            session.status,
                                        );
                                        return (
                                            <tr
                                                key={session._id}
                                                className="hover:bg-(--bg-base) transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-(--brand-primary) bg-opacity-10 border border-(--brand-primary) border-opacity-20 rounded-xl flex items-center justify-center shrink-0">
                                                            <CalendarDays
                                                                size={18}
                                                                className="text-(--brand-primary)"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-(--text-primary)">
                                                                {
                                                                    session.startYear
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    session.endYear
                                                                }
                                                            </p>
                                                            <p className="text-[11px] text-(--text-secondary) font-bold uppercase tracking-wider mt-0.5">
                                                                Session Term
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-sm text-(--text-primary)">
                                                        Semester{" "}
                                                        {
                                                            session.currentSemester
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Chip
                                                        label={
                                                            session.enrollmentOpen
                                                                ? "Open"
                                                                : "Closed"
                                                        }
                                                        size="small"
                                                        className={`text-[10px]! font-bold! uppercase! tracking-wider! h-5! px-1.5! border ${session.enrollmentOpen ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-(--bg-base) text-(--text-secondary) border-(--ui-border)"}`}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-(--text-primary)">
                                                            {
                                                                session.totalEnrolledStudents
                                                            }{" "}
                                                            <span className="text-(--text-secondary) font-medium">
                                                                /{" "}
                                                                {session.intakeCapacity ||
                                                                    "∞"}
                                                            </span>
                                                        </span>
                                                        <span className="text-[10px] text-(--text-secondary) uppercase tracking-wider font-bold mt-0.5">
                                                            Students
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Chip
                                                        label={config.label}
                                                        size="small"
                                                        className={`text-[10px]! font-bold! uppercase! tracking-wider! h-5! px-1.5! border ${config.className}`}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <IconButton
                                                            size="small"
                                                            title="Edit Capacity"
                                                            onClick={() => {
                                                                setEditingSession(
                                                                    session,
                                                                );
                                                                setDrawerOpen(
                                                                    true,
                                                                );
                                                            }}
                                                            sx={{
                                                                color: "var(--text-secondary)",
                                                                "&:hover": {
                                                                    color: "var(--brand-primary)",
                                                                    bgcolor:
                                                                        "var(--brand-active)",
                                                                },
                                                            }}
                                                        >
                                                            <Pencil size={16} />
                                                        </IconButton>

                                                        {session.enrollmentOpen && (
                                                            <IconButton
                                                                size="small"
                                                                title="Close Enrollment"
                                                                onClick={() =>
                                                                    handleCloseEnrollment(
                                                                        session,
                                                                    )
                                                                }
                                                                sx={{
                                                                    color: "var(--text-secondary)",
                                                                    "&:hover": {
                                                                        color: "var(--status-danger)",
                                                                        bgcolor:
                                                                            "var(--bg-base)",
                                                                    },
                                                                }}
                                                            >
                                                                <DoorClosed
                                                                    size={16}
                                                                />
                                                            </IconButton>
                                                        )}

                                                        {(session.status ===
                                                            "active" ||
                                                            session.status ===
                                                            "locked") && (
                                                                <IconButton
                                                                    size="small"
                                                                    title={
                                                                        session.status ===
                                                                            "locked"
                                                                            ? "Unlock Session"
                                                                            : "Lock Session"
                                                                    }
                                                                    onClick={() =>
                                                                        handleLockToggle(
                                                                            session,
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        color: "var(--text-secondary)",
                                                                        "&:hover": {
                                                                            color: "var(--brand-primary)",
                                                                            bgcolor:
                                                                                "var(--brand-active)",
                                                                        },
                                                                    }}
                                                                >
                                                                    {session.status ===
                                                                        "locked" ? (
                                                                        <Unlock
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <Lock
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    )}
                                                                </IconButton>
                                                            )}

                                                        {session.status ===
                                                            "active" && (
                                                                <IconButton
                                                                    size="small"
                                                                    title="Promote Semester"
                                                                    onClick={() =>
                                                                        setPromoteSession(
                                                                            session,
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        color: "var(--text-secondary)",
                                                                        "&:hover": {
                                                                            color: "var(--brand-primary)",
                                                                            bgcolor:
                                                                                "var(--brand-active)",
                                                                        },
                                                                    }}
                                                                >
                                                                    <ArrowUpCircle
                                                                        size={16}
                                                                    />
                                                                </IconButton>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TablePagination
                        component="div"
                        count={sessionPagination?.total ?? sessions.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{
                            borderTop: "1px solid var(--ui-divider)",
                            ".MuiTablePagination-selectLabel,.MuiTablePagination-displayedRows":
                            {
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--text-secondary)",
                            },
                        }}
                    />
                </div>
            </div>

            <SessionDrawer
                open={drawerOpen}
                editing={editingSession}
                selectedDept={selectedDept}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditingSession(null);
                }}
            />
            <PromoteDialog
                open={!!promoteSession}
                session={promoteSession}
                selectedDept={selectedDept}
                onClose={() => setPromoteSession(null)}
            />
        </div>
    );
};

export default AcademicSessions;
