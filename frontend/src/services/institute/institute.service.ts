import { baseQuery } from "../BaseQuery";

export interface InstituteLocation {
    address: string;
    city: string;
    country: string;
}

export interface Institute {
    _id: string;
    name: string;
    domain: string;
    location: InstituteLocation;
    contactPhone?: string;
    contactEmail?: string;
    website?: string;
    type: "university" | "college" | "school" | "polytechnic";
    establishedYear?: number;
    logoInitials: string;
    isActive: boolean;
    principal?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    } | null;
    studentsCount: number;
    departmentsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetAllInstitutesParams {
    search?: string;
    page?: number;
    limit?: number;
}

export interface GetAllInstitutesResponse {
    success: boolean;
    data: Institute[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface InstituteResponse {
    success: boolean;
    message: string;
    data: Institute;
}

export interface CreateInstitutePayload {
    name: string;
    domain: string;
    location: InstituteLocation;
    contactPhone?: string;
    contactEmail?: string;
    website?: string;
    type: "university" | "college" | "school" | "polytechnic";
    establishedYear?: number;
    logoInitials: string;
    principal?: string;
}

export type UpdateInstitutePayload = Partial<CreateInstitutePayload>;

export const instituteApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getAllInstitutes: builder.query<
            GetAllInstitutesResponse,
            GetAllInstitutesParams | void
        >({
            query: (params) => {
                const queryString = params
                    ? new URLSearchParams(
                          Object.entries(params)
                              .filter(([, v]) => v !== undefined && v !== "")
                              .map(([k, v]) => [k, String(v)]),
                      ).toString()
                    : "";
                return `/institutes${queryString ? `?${queryString}` : ""}`;
            },
            providesTags: ["Institute"],
        }),

        getInstituteById: builder.query<InstituteResponse, string>({
            query: (id) => `/institutes/${id}`,
            providesTags: (_result, _err, id) => [{ type: "Institute", id }],
        }),

        createInstitute: builder.mutation<
            InstituteResponse,
            CreateInstitutePayload
        >({
            query: (body) => ({
                url: "/institutes",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Institute"],
        }),

        updateInstitute: builder.mutation<
            InstituteResponse,
            { id: string; data: UpdateInstitutePayload }
        >({
            query: ({ id, data }) => ({
                url: `/institutes/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_result, _err, { id }) => [
                "Institute",
                { type: "Institute", id },
            ],
        }),

        deleteInstitute: builder.mutation<
            { success: boolean; message: string },
            string
        >({
            query: (id) => ({
                url: `/institutes/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Institute"],
        }),

        toggleInstituteStatus: builder.mutation<InstituteResponse, string>({
            query: (id) => ({
                url: `/institutes/${id}/toggle-status`,
                method: "PATCH",
            }),
            invalidatesTags: (_result, _err, id) => [
                "Institute",
                { type: "Institute", id },
            ],
        }),

        assignPrincipal: builder.mutation<
            InstituteResponse,
            { id: string; principalId: string }
        >({
            query: ({ id, principalId }) => ({
                url: `/institutes/${id}/assign-principal`,
                method: "PATCH",
                body: { principalId },
            }),
            invalidatesTags: (_result, _err, { id }) => [
                "Institute",
                { type: "Institute", id },
            ],
        }),

        // Principal-scoped: own institute
        getMyInstitute: builder.query<InstituteResponse, void>({
            query: () => "/institutes/my",
            providesTags: ["Institute"],
        }),

        updateMyInstitute: builder.mutation<
            InstituteResponse,
            UpdateInstitutePayload
        >({
            query: (body) => ({
                url: "/institutes/my",
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Institute"],
        }),
    }),
});

export const {
    useGetAllInstitutesQuery,
    useGetInstituteByIdQuery,
    useCreateInstituteMutation,
    useUpdateInstituteMutation,
    useDeleteInstituteMutation,
    useToggleInstituteStatusMutation,
    useAssignPrincipalMutation,
    useGetMyInstituteQuery,
    useUpdateMyInstituteMutation,
} = instituteApi;
