import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserInstitute {
    _id: string;
    name: string;
    logoInitials: string;
}

export interface UserDepartment {
    _id: string;
    name: string;
}

export type UserRole = "admin" | "principal" | "hod" | "teacher" | "student";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    institute?: UserInstitute | null;
    department?: UserDepartment | null;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllUsersParams {
    search?: string;
    role?: string;
    institute?: string;
    page?: number;
    limit?: number;
}

export interface GetAllUsersResponse {
    success: boolean;
    data: User[];
    stats: Record<string, number>; // e.g. { admin: 2, student: 340, ... }
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User;
}

export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    institute?: string;
    department?: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">>;

export interface ResetPasswordPayload {
    newPassword: string;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const userApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getAllUsers: builder.query<
            GetAllUsersResponse,
            GetAllUsersParams | void
        >({
            query: (params) => {
                const queryString = params
                    ? new URLSearchParams(
                          Object.entries(params)
                              .filter(([, v]) => v !== undefined && v !== "")
                              .map(([k, v]) => [k, String(v)]),
                      ).toString()
                    : "";
                return `/users${queryString ? `?${queryString}` : ""}`;
            },
            providesTags: ["User"],
        }),

        getUserById: builder.query<UserResponse, string>({
            query: (id) => `/users/${id}`,
            providesTags: (_result, _err, id) => [{ type: "User", id }],
        }),

        createUser: builder.mutation<UserResponse, CreateUserPayload>({
            query: (body) => ({
                url: "/users",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),

        updateUser: builder.mutation<
            UserResponse,
            { id: string; data: UpdateUserPayload }
        >({
            query: ({ id, data }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_result, _err, { id }) => [
                "User",
                { type: "User", id },
            ],
        }),

        deleteUser: builder.mutation<
            { success: boolean; message: string },
            string
        >({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        toggleUserStatus: builder.mutation<UserResponse, string>({
            query: (id) => ({
                url: `/users/${id}/toggle-status`,
                method: "PATCH",
            }),
            invalidatesTags: (_result, _err, id) => [
                "User",
                { type: "User", id },
            ],
        }),

        adminResetPassword: builder.mutation<
            { success: boolean; message: string },
            { id: string; data: ResetPasswordPayload }
        >({
            query: ({ id, data }) => ({
                url: `/users/${id}/reset-password`,
                method: "PATCH",
                body: data,
            }),
        }),

        // Principal-scoped: create HOD account
        createHOD: builder.mutation<
            { success: boolean; message: string; data: User },
            {
                firstName: string;
                lastName: string;
                email: string;
                password: string;
            }
        >({
            query: (body) => ({
                url: "/users/hod",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserStatusMutation,
    useAdminResetPasswordMutation,
    useCreateHODMutation,
} = userApi;
