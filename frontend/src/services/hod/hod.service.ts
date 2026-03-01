import { baseQuery } from "../BaseQuery";

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface FacultyMember {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "teacher";
    isActive: boolean;
    department: string;
    institute: string;
    createdAt: string;
}

export interface HODStats {
    totalSessions: number;
    activeSessions: number;
    facultyCount: number;
    studentCount: number;
}

export interface HODDashboardData {
    sessions: any[];
    stats: HODStats;
}

export interface DepartmentInfo {
    _id: string;
    name: string;
    code: string;
}

export interface HODProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: DepartmentInfo;
    institute: { _id: string; name: string };
}

// ─── API ──────────────────────────────────────────────────────────────────────
const hodApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getHODProfile: builder.query<
            { success: boolean; data: HODProfile },
            void
        >({
            query: () => "/hod/profile",
            providesTags: ["HODProfile"],
        }),

        getHODDashboard: builder.query<
            { success: boolean; data: HODDashboardData },
            void
        >({
            query: () => "/hod/dashboard",
            providesTags: ["HODDashboard"],
        }),

        getFacultyByDept: builder.query<
            { success: boolean; data: FacultyMember[] },
            void
        >({
            query: () => "/hod/faculty",
            providesTags: ["Faculty"],
        }),

        createFaculty: builder.mutation<
            { success: boolean; message: string; data: FacultyMember },
            {
                firstName: string;
                lastName: string;
                email: string;
                password: string;
            }
        >({
            query: (body) => ({
                url: "/hod/faculty",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Faculty", "HODDashboard"],
        }),

        toggleFacultyStatus: builder.mutation<
            { success: boolean; message: string; data: FacultyMember },
            string
        >({
            query: (id) => ({
                url: `/hod/faculty/${id}/toggle`,
                method: "PATCH",
            }),
            invalidatesTags: ["Faculty"],
        }),
    }),
});

export const {
    useGetHODProfileQuery,
    useGetHODDashboardQuery,
    useGetFacultyByDeptQuery,
    useCreateFacultyMutation,
    useToggleFacultyStatusMutation,
} = hodApi;
