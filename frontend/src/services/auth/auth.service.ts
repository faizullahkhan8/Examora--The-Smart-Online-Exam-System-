import { baseQuery } from "../BaseQuery";

export const authApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["Auth"],
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: "/auth/register",
                method: "POST",
                body: credentials,
            }),
            invalidatesTags: ["Auth"],
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
