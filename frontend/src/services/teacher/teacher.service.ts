import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DepartmentInfo {
    _id: string;
    name: string;
    code: string;
}
export interface SessionInfo {
    _id: string;
    startYear: number;
    endYear: number;
    currentSemester: number;
    status: string;
}

export interface TeacherProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "teacher";
    department: DepartmentInfo;
    institute: { _id: string; name: string };
    isActive: boolean;
}

export interface TeacherDashboardStats {
    totalSubjects: number;
    totalStudents: number;
    pendingPapers: number;
    draftPapers: number;
    approvedPapers: number;
    totalPapers: number;
}

export interface TeacherDashboardData {
    subjects: Subject[];
    stats: TeacherDashboardStats;
}

export interface Subject {
    _id: string;
    name: string;
    code: string;
    semester: number;
    creditHours: number;
    isActive: boolean;
    department: DepartmentInfo;
    session: SessionInfo;
    teacher?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface StudentInfo {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────
const teacherApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getTeacherProfile: builder.query<
            { success: boolean; data: TeacherProfile },
            void
        >({
            query: () => "/teacher/profile",
            providesTags: ["TeacherProfile"],
        }),

        getTeacherDashboard: builder.query<
            { success: boolean; data: TeacherDashboardData },
            void
        >({
            query: () => "/teacher/dashboard",
            providesTags: ["TeacherDashboard"],
        }),

        getMySubjects: builder.query<
            { success: boolean; data: Subject[] },
            void
        >({
            query: () => "/teacher/subjects",
            providesTags: ["Subject"],
        }),

        getSubjectById: builder.query<
            { success: boolean; data: Subject },
            string
        >({
            query: (id) => `/teacher/subjects/${id}`,
            providesTags: ["Subject"],
        }),

        getSubjectStudents: builder.query<
            { success: boolean; data: StudentInfo[] },
            string
        >({
            query: (id) => `/teacher/subjects/${id}/students`,
        }),
    }),
});

export const {
    useGetTeacherProfileQuery,
    useGetTeacherDashboardQuery,
    useGetMySubjectsQuery,
    useGetSubjectByIdQuery,
    useGetSubjectStudentsQuery,
} = teacherApi;
