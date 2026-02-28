import { baseQuery } from "../BaseQuery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParticipantUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    institute?: { _id: string; name: string; logoInitials: string } | null;
    isActive: boolean;
}

export interface MessageSender {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    institute?: { _id: string; name: string; logoInitials: string } | null;
}

export interface LastMessage {
    _id: string;
    text: string;
    sender: { _id: string; firstName: string; lastName: string };
    createdAt: string;
}

export interface Conversation {
    _id: string;
    type: "direct" | "group" | "announcement";
    name?: string;
    participants: ParticipantUser[];
    lastMessage?: LastMessage | null;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    conversation: string;
    sender: MessageSender;
    text: string;
    readBy: string[];
    createdAt: string;
    updatedAt: string;
}

export interface GetConversationsResponse {
    success: boolean;
    data: Conversation[];
}

export interface GetMessagesResponse {
    success: boolean;
    data: Message[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface ConversationResponse {
    success: boolean;
    message: string;
    data: Conversation;
}

export interface MessageResponse {
    success: boolean;
    message: string;
    data: Message;
}

export interface CreateConversationPayload {
    type: "direct" | "group" | "announcement";
    name?: string;
    participants: string[];
}

export interface SendMessagePayload {
    conversationId: string;
    text: string;
}

export interface SearchUsersResponse {
    success: boolean;
    data: ParticipantUser[];
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const messengerApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<GetConversationsResponse, void>({
            query: () => "/messenger/conversations",
            providesTags: ["Messenger"],
        }),

        createConversation: builder.mutation<
            ConversationResponse,
            CreateConversationPayload
        >({
            query: (body) => ({
                url: "/messenger/conversations",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Messenger"],
        }),

        getMessages: builder.query<
            GetMessagesResponse,
            { conversationId: string; page?: number }
        >({
            query: ({ conversationId, page = 1 }) =>
                `/messenger/conversations/${conversationId}/messages?page=${page}&limit=50`,
            providesTags: (_result, _err, { conversationId }) => [
                { type: "Messenger", id: conversationId },
            ],
        }),

        sendMessage: builder.mutation<MessageResponse, SendMessagePayload>({
            query: ({ conversationId, text }) => ({
                url: `/messenger/conversations/${conversationId}/messages`,
                method: "POST",
                body: { text },
            }),
            invalidatesTags: (_result, _err, { conversationId }) => [
                "Messenger",
                { type: "Messenger", id: conversationId },
            ],
        }),

        deleteConversation: builder.mutation<
            { success: boolean; message: string },
            string
        >({
            query: (id) => ({
                url: `/messenger/conversations/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Messenger"],
        }),

        searchUsers: builder.query<SearchUsersResponse, string>({
            query: (q) =>
                `/messenger/users/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useCreateConversationMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useDeleteConversationMutation,
    useSearchUsersQuery,
} = messengerApi;
