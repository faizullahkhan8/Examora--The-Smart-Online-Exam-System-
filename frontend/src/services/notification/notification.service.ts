import { baseQuery } from "../BaseQuery";

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

export interface NotificationMessageResponse {
    success: boolean;
    message: string;
}

export interface CreateNotificationPayload {
    recipient: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
}

const toQueryString = (params?: GetNotificationsParams | void): string => {
    if (!params) return "";

    return new URLSearchParams(
        Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== "" && value !== null)
            .map(([key, value]) => [key, String(value)]),
    ).toString();
};

export const notificationApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<
            GetNotificationsResponse,
            GetNotificationsParams | void
        >({
            query: (params) => {
                const queryString = toQueryString(params);
                return `/notifications${queryString ? `?${queryString}` : ""}`;
            },
            providesTags: ["Notification"],
        }),

        getUnreadNotificationsCount: builder.query<number, void>({
            query: () =>
                "/notifications?isRead=false&isArchived=false&page=1&limit=1",
            transformResponse: (response: GetNotificationsResponse) =>
                response.unreadCount,
            providesTags: ["Notification"],
        }),

        markOneRead: builder.mutation<NotificationResponse, string>({
            query: (id) => ({
                url: `/notifications/${id}/read`,
                method: "PATCH",
            }),
            invalidatesTags: ["Notification"],
        }),

        markAllRead: builder.mutation<NotificationMessageResponse, void>({
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
            NotificationMessageResponse,
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
    useGetUnreadNotificationsCountQuery,
    useMarkOneReadMutation,
    useMarkAllReadMutation,
    useArchiveOneMutation,
    useDeleteNotificationMutation,
    useCreateNotificationMutation,
} = notificationApi;
