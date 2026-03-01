import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Material {
    _id: string;
    subject:
        | string
        | { _id: string; name: string; code: string; semester: number };
    teacher: string | { _id: string; firstName: string; lastName: string };
    department: string;
    title: string;
    type: "pdf" | "link" | "note";
    content: string;
    semester: number;
    createdAt: string;
}

const materialApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getMaterialsBySubject: builder.query<
            { success: boolean; data: Material[] },
            string
        >({
            query: (subjectId) => `/materials/subject/${subjectId}`,
            providesTags: ["Material"],
        }),

        getDeptMaterials: builder.query<
            { success: boolean; data: Material[] },
            void
        >({
            query: () => "/materials/dept",
            providesTags: ["Material"],
        }),

        createMaterial: builder.mutation<
            { success: boolean; data: Material; message: string },
            {
                subjectId: string;
                title: string;
                type: "pdf" | "link" | "note";
                content: string;
            }
        >({
            query: (body) => ({ url: "/materials", method: "POST", body }),
            invalidatesTags: ["Material"],
        }),

        deleteMaterial: builder.mutation<
            { success: boolean; message: string },
            string
        >({
            query: (id) => ({ url: `/materials/${id}`, method: "DELETE" }),
            invalidatesTags: ["Material"],
        }),
    }),
});

export const {
    useGetMaterialsBySubjectQuery,
    useGetDeptMaterialsQuery,
    useCreateMaterialMutation,
    useDeleteMaterialMutation,
} = materialApi;
