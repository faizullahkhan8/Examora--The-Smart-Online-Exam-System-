import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "security" | "user" | "system" | "institute";
export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
    _id: string;
    recipient: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    isRead: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetNotificationsParams {
    type?: NotificationType | "";
    isRead?: boolean | "";
    isArchived?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface GetNotificationsResponse {
    success: boolean;
    data: Notification[];
    unreadCount: number;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface NotificationResponse {
    success: boolean;
    message: string;
    data: Notification;
}

export interface CreateNotificationPayload {
    recipient: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const notificationApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<
            GetNotificationsResponse,
            GetNotificationsParams | void
        >({
            query: (params) => {
                const queryString = params
                    ? new URLSearchParams(
                          Object.entries(params)
                              .filter(
                                  ([, v]) =>
                                      v !== undefined && v !== "" && v !== null,
                              )
                              .map(([k, v]) => [k, String(v)]),
                      ).toString()
                    : "";
                return `/notifications${queryString ? `?${queryString}` : ""}`;
            },
            providesTags: ["Notification"],
        }),

        markOneRead: builder.mutation<NotificationResponse, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["Notification"],
        }),

        markAllRead: builder.mutation<
            { success: boolean; message: string },
            void
        >({
            query: () => ({
                url: "/notifications/mark-all-read",
                method: "PATCH",
            }),
            invalidatesTags: ["Notification"],
        }),

        archiveOne: builder.mutation<NotificationResponse, string>({
            query: (id) => ({
                url: `/notifications/${id}/archive`,
                method: "PATCH",
            }),
            invalidatesTags: ["Notification"],
        }),

        deleteNotification: builder.mutation<
            { success: boolean; message: string },
            string
        >({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Notification"],
        }),

        createNotification: builder.mutation<
            NotificationResponse,
            CreateNotificationPayload
        >({
            query: (body) => ({
                url: "/notifications",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Notification"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkOneReadMutation,
    useMarkAllReadMutation,
    useArchiveOneMutation,
    useDeleteNotificationMutation,
    useCreateNotificationMutation,
} = notificationApi;
