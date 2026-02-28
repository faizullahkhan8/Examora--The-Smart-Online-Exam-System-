import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HODUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive?: boolean;
}

export interface Department {
    _id: string;
    name: string;
    code: string;
    description?: string;
    institute: string;
    hod?: HODUser | null;
    capacity?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetDepartmentsParams {
    search?: string;
    isActive?: boolean | "";
}

export interface GetDepartmentsResponse {
    success: boolean;
    data: Department[];
    total: number;
}

export interface DepartmentResponse {
    success: boolean;
    message: string;
    data: Department;
}

export interface CreateDepartmentPayload {
    name: string;
    code: string;
    description?: string;
    capacity?: number;
}

export interface UpdateDepartmentPayload {
    name?: string;
    code?: string;
    description?: string;
    capacity?: number;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const departmentApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getDepartments: builder.query<
            GetDepartmentsResponse,
            GetDepartmentsParams | void
        >({
            query: (params) => {
                const qs = params
                    ? new URLSearchParams(
                          Object.entries(params)
                              .filter(([, v]) => v !== undefined && v !== "")
                              .map(([k, v]) => [k, String(v)]),
                      ).toString()
                    : "";
                return `/departments${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["Department"],
        }),

        getDepartment: builder.query<DepartmentResponse, string>({
            query: (id) => `/departments/${id}`,
            providesTags: ["Department"],
        }),

        createDepartment: builder.mutation<
            DepartmentResponse,
            CreateDepartmentPayload
        >({
            query: (body) => ({ url: "/departments", method: "POST", body }),
            invalidatesTags: ["Department"],
        }),

        updateDepartment: builder.mutation<
            DepartmentResponse,
            { id: string; data: UpdateDepartmentPayload }
        >({
            query: ({ id, data }) => ({
                url: `/departments/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Department"],
        }),

        toggleDepartmentStatus: builder.mutation<DepartmentResponse, string>({
            query: (id) => ({
                url: `/departments/${id}/toggle-status`,
                method: "PATCH",
            }),
            invalidatesTags: ["Department"],
        }),

        assignHOD: builder.mutation<
            DepartmentResponse,
            { id: string; hodId: string }
        >({
            query: ({ id, hodId }) => ({
                url: `/departments/${id}/assign-hod`,
                method: "PATCH",
                body: { hodId },
            }),
            invalidatesTags: ["Department"],
        }),

        removeHOD: builder.mutation<DepartmentResponse, string>({
            query: (id) => ({
                url: `/departments/${id}/remove-hod`,
                method: "PATCH",
            }),
            invalidatesTags: ["Department"],
        }),

        deleteDepartment: builder.mutation<
            { success: boolean; message: string },
            string
        >({
            query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
            invalidatesTags: ["Department"],
        }),
    }),
});

export const {
    useGetDepartmentsQuery,
    useGetDepartmentQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useToggleDepartmentStatusMutation,
    useAssignHODMutation,
    useRemoveHODMutation,
    useDeleteDepartmentMutation,
} = departmentApi;
