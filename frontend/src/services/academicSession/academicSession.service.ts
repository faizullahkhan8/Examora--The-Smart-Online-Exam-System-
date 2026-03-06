import { baseQuery } from "../BaseQuery";

export interface AcademicSession {
    _id: string;
    startYear: number;
    endYear: number;
    department: string | { _id: string; name: string; code: string };
    institute: string;
    currentSemester: number;
    status: "upcoming" | "active" | "locked" | "completed";
    intakeCapacity: number;
    totalEnrolledStudents: number;
    enrollmentOpen: boolean;
    nextPromotionDate: string;
    createdBy: string | { _id: string; firstName: string; lastName: string };
    createdAt: string;
    updatedAt: string;
}

interface SessionListResponse {
    success: boolean;
    data: AcademicSession[];
    pagination?: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

interface SessionResponse {
    success: boolean;
    data: AcademicSession;
    message?: string;
}

interface AnalyticsResponse {
    success: boolean;
    data: AcademicSession[];
    stats: Record<string, { count: number; totalStudents: number }>;
}

const academicSessionApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        // ─── Read ───────────────────────────────────────────────────────────
        getSessionsByDept: builder.query<
            SessionListResponse,
            { deptId: string; page?: number; limit?: number }
        >({
            query: ({ deptId, page, limit }) => {
                const qs = new URLSearchParams();
                if (page !== undefined) qs.set("page", String(page));
                if (limit !== undefined) qs.set("limit", String(limit));
                const qString = qs.toString();
                return `/sessions/${deptId}${qString ? `?${qString}` : ""}`;
            },
            providesTags: ["AcademicSession"],
        }),

        getSessionById: builder.query<
            SessionResponse,
            { deptId: string; id: string }
        >({
            query: ({ deptId, id }) => `/sessions/${deptId}/${id}`,
            providesTags: ["AcademicSession"],
        }),

        getSessionAnalytics: builder.query<AnalyticsResponse, void>({
            query: () => "/sessions/analytics",
            providesTags: ["AcademicSession"],
        }),

        // ─── Write ──────────────────────────────────────────────────────────
        createSession: builder.mutation<
            SessionResponse,
            { deptId: string; startYear: number; intakeCapacity?: number }
        >({
            query: ({ deptId, ...body }) => ({
                url: `/sessions/${deptId}`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["AcademicSession"],
        }),

        updateSession: builder.mutation<
            SessionResponse,
            { deptId: string; id: string; intakeCapacity?: number }
        >({
            query: ({ deptId, id, ...body }) => ({
                url: `/sessions/${deptId}/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["AcademicSession"],
        }),

        // ─── Status transitions ─────────────────────────────────────────────
        lockSession: builder.mutation<
            SessionResponse,
            { deptId: string; id: string }
        >({
            query: ({ deptId, id }) => ({
                url: `/sessions/${deptId}/${id}/lock`,
                method: "PATCH",
            }),
            invalidatesTags: ["AcademicSession"],
        }),

        unlockSession: builder.mutation<
            SessionResponse,
            { deptId: string; id: string }
        >({
            query: ({ deptId, id }) => ({
                url: `/sessions/${deptId}/${id}/unlock`,
                method: "PATCH",
            }),
            invalidatesTags: ["AcademicSession"],
        }),

        closeEnrollment: builder.mutation<
            SessionResponse,
            { deptId: string; id: string }
        >({
            query: ({ deptId, id }) => ({
                url: `/sessions/${deptId}/${id}/close-enrollment`,
                method: "PATCH",
            }),
            invalidatesTags: ["AcademicSession"],
        }),

        // ─── Promotion ──────────────────────────────────────────────────────
        manualPromote: builder.mutation<
            SessionResponse,
            { deptId: string; id: string; reason: string }
        >({
            query: ({ deptId, id, reason }) => ({
                url: `/sessions/${deptId}/${id}/promote`,
                method: "PATCH",
                body: { reason },
            }),
            invalidatesTags: ["AcademicSession"],
        }),
    }),
});

export const {
    useGetSessionsByDeptQuery,
    useGetSessionByIdQuery,
    useGetSessionAnalyticsQuery,
    useCreateSessionMutation,
    useUpdateSessionMutation,
    useLockSessionMutation,
    useUnlockSessionMutation,
    useCloseEnrollmentMutation,
    useManualPromoteMutation,
} = academicSessionApi;
