import { baseQuery } from "../BaseQuery";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MeetingUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: string | null;
}

export interface MeetingParticipant {
    user: MeetingUser;
    acknowledgement: "pending" | "attending" | "not_attending";
    acknowledgementReason: string;
    attendanceStatus: "present" | "absent" | "excused" | null;
}

export interface BulkGroup {
    type: "all_faculty" | "all_students" | "all_staff" | "department" | "semester" | "course" | "role";
    department?: string;
    semester?: number;
    course?: string;
    role?: string;
    /** Generic sub-value (dept ID, session ID, class name, role key, etc.) */
    subValue?: string;
    /** For semester-wise grouping: the selected department ID */
    departmentId?: string;
}

export interface Meeting {
    _id: string;
    title: string;
    description: string;
    organizer: MeetingUser;
    date: string;
    startTime: string;
    endTime: string;
    locationType: "physical" | "online";
    location: string;
    meetingLink: string;
    status: "draft" | "scheduled" | "cancelled" | "completed";
    participantMode: "bulk" | "individual" | "single";
    bulkGroup?: BulkGroup;
    participants: MeetingParticipant[];
    notes: string;
    attachments: { name: string; url: string; uploadedAt: string }[];
    createdAt: string;
    updatedAt: string;
}

export interface MeetingsResponse {
    success: boolean;
    data: Meeting[];
}

export interface MeetingResponse {
    success: boolean;
    data: Meeting;
    message?: string;
}

export interface CreateMeetingPayload {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    locationType: "physical" | "online";
    location?: string;
    meetingLink?: string;
    status: "draft" | "scheduled";
    participantMode: "bulk" | "individual" | "single";
    bulkGroup?: BulkGroup;
    participants?: string[];
}

export interface UpdateMeetingPayload {
    id: string;
    title?: string;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    locationType?: "physical" | "online";
    location?: string;
    meetingLink?: string;
    notes?: string;
}

export interface UpdateMeetingStatusPayload {
    id: string;
    status: "draft" | "scheduled" | "cancelled" | "completed";
}

export interface AddParticipantsPayload {
    id: string;
    participants: string[];
}

export interface AcknowledgePayload {
    id: string;
    acknowledgement: "attending" | "not_attending";
    acknowledgementReason?: string;
}

export interface MarkAttendancePayload {
    id: string;
    attendance: { userId: string; status: "present" | "absent" | "excused" }[];
}

// ─── API Slice ─────────────────────────────────────────────────────────────────

export const meetingApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getMeetings: builder.query<MeetingsResponse, { tab?: string; status?: string }>({
            query: ({ tab = "participant", status = "all" } = {}) =>
                `/meetings?tab=${tab}&status=${status}`,
            providesTags: ["Meeting"],
        }),

        getMeetingById: builder.query<MeetingResponse, string>({
            query: (id) => `/meetings/${id}`,
            providesTags: (_r, _e, id) => [{ type: "Meeting", id }],
        }),

        createMeeting: builder.mutation<MeetingResponse, CreateMeetingPayload>({
            query: (body) => ({ url: "/meetings", method: "POST", body }),
            invalidatesTags: ["Meeting"],
        }),

        updateMeeting: builder.mutation<MeetingResponse, UpdateMeetingPayload>({
            query: ({ id, ...body }) => ({ url: `/meetings/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Meeting"],
        }),

        updateMeetingStatus: builder.mutation<MeetingResponse, UpdateMeetingStatusPayload>({
            query: ({ id, ...body }) => ({ url: `/meetings/${id}/status`, method: "PATCH", body }),
            invalidatesTags: ["Meeting"],
        }),

        deleteMeeting: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({ url: `/meetings/${id}`, method: "DELETE" }),
            invalidatesTags: ["Meeting"],
        }),

        addParticipants: builder.mutation<MeetingResponse, AddParticipantsPayload>({
            query: ({ id, ...body }) => ({ url: `/meetings/${id}/participants`, method: "PATCH", body }),
            invalidatesTags: ["Meeting"],
        }),

        acknowledgeMeeting: builder.mutation<{ success: boolean; message: string }, AcknowledgePayload>({
            query: ({ id, ...body }) => ({ url: `/meetings/${id}/acknowledge`, method: "PATCH", body }),
            invalidatesTags: ["Meeting"],
        }),

        markAttendance: builder.mutation<MeetingResponse, MarkAttendancePayload>({
            query: ({ id, ...body }) => ({ url: `/meetings/${id}/attendance`, method: "PATCH", body }),
            invalidatesTags: ["Meeting"],
        }),
    }),
});

export const {
    useGetMeetingsQuery,
    useGetMeetingByIdQuery,
    useCreateMeetingMutation,
    useUpdateMeetingMutation,
    useUpdateMeetingStatusMutation,
    useDeleteMeetingMutation,
    useAddParticipantsMutation,
    useAcknowledgeMeetingMutation,
    useMarkAttendanceMutation,
} = meetingApi;
