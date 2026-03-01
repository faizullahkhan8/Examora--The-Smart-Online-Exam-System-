import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ExamQuestion {
    text: string;
    marks: number;
    type: "mcq" | "short" | "long";
    options?: string[];
}

export interface ExamPaper {
    _id: string;
    subject:
        | { _id: string; name: string; code: string; semester: number }
        | string;
    teacher: { _id: string; firstName: string; lastName: string } | string;
    department: string;
    session: string;
    semester: number;
    title: string;
    questions: ExamQuestion[];
    totalMarks: number;
    duration: number;
    status: "draft" | "submitted" | "approved" | "rejected";
    rejectionReason?: string;
    createdAt: string;
}

interface ExamPaperListResponse {
    success: boolean;
    data: ExamPaper[];
}
interface ExamPaperResponse {
    success: boolean;
    data: ExamPaper;
    message?: string;
}

const examPaperApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getMyExamPapers: builder.query<ExamPaperListResponse, void>({
            query: () => "/exam-papers/my",
            providesTags: ["ExamPaper"],
        }),

        getExamPapersBySubject: builder.query<ExamPaperListResponse, string>({
            query: (subjectId) => `/exam-papers/subject/${subjectId}`,
            providesTags: ["ExamPaper"],
        }),

        getDeptExamPapers: builder.query<ExamPaperListResponse, void>({
            query: () => "/exam-papers/dept",
            providesTags: ["ExamPaper"],
        }),

        createExamPaper: builder.mutation<
            ExamPaperResponse,
            {
                subjectId: string;
                title: string;
                questions: ExamQuestion[];
                totalMarks: number;
                duration: number;
            }
        >({
            query: (body) => ({ url: "/exam-papers", method: "POST", body }),
            invalidatesTags: ["ExamPaper"],
        }),

        updateExamPaper: builder.mutation<
            ExamPaperResponse,
            { id: string; [key: string]: any }
        >({
            query: ({ id, ...body }) => ({
                url: `/exam-papers/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["ExamPaper"],
        }),

        submitExamPaper: builder.mutation<ExamPaperResponse, string>({
            query: (id) => ({
                url: `/exam-papers/${id}/submit`,
                method: "PATCH",
            }),
            invalidatesTags: ["ExamPaper"],
        }),

        reviewExamPaper: builder.mutation<
            ExamPaperResponse,
            { id: string; action: "approve" | "reject"; reason?: string }
        >({
            query: ({ id, ...body }) => ({
                url: `/exam-papers/${id}/review`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["ExamPaper"],
        }),
    }),
});

export const {
    useGetMyExamPapersQuery,
    useGetExamPapersBySubjectQuery,
    useGetDeptExamPapersQuery,
    useCreateExamPaperMutation,
    useUpdateExamPaperMutation,
    useSubmitExamPaperMutation,
    useReviewExamPaperMutation,
} = examPaperApi;
