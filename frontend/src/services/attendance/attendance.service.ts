import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AttendanceRecord {
    student: string;
    present: boolean;
}

export interface AttendanceEntry {
    _id: string;
    subject: string;
    teacher: string;
    department: string;
    date: string;
    semester: number;
    records: (AttendanceRecord & {
        student:
            | {
                  _id: string;
                  firstName: string;
                  lastName: string;
                  email: string;
              }
            | string;
    })[];
}

export interface MyAttendanceSummary {
    records: { date: string; present: boolean }[];
    total: number;
    attended: number;
    percentage: number;
}

const attendanceApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        markAttendance: builder.mutation<
            { success: boolean; message: string; data: AttendanceEntry },
            { subjectId: string; date: string; records: AttendanceRecord[] }
        >({
            query: (body) => ({ url: "/attendance", method: "POST", body }),
            invalidatesTags: ["Attendance"],
        }),

        getAttendanceBySubject: builder.query<
            { success: boolean; data: AttendanceEntry[] },
            string
        >({
            query: (subjectId) => `/attendance/subject/${subjectId}`,
            providesTags: ["Attendance"],
        }),

        getMyAttendance: builder.query<
            { success: boolean; data: MyAttendanceSummary },
            string
        >({
            query: (subjectId) => `/attendance/my/${subjectId}`,
            providesTags: ["Attendance"],
        }),
    }),
});

export const {
    useMarkAttendanceMutation,
    useGetAttendanceBySubjectQuery,
    useGetMyAttendanceQuery,
} = attendanceApi;
