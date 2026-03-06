import { baseQuery } from "../BaseQuery";

export type AuditSeverity = "Info" | "Warning" | "Critical";
export type AuditStatus = "Success" | "Failed";

export interface AuditLog {
    _id: string;
    actorId?: string | null;
    actorLabel: string;
    actorRole: string;
    eventType: string;
    resource: string;
    method: string;
    path: string;
    targetId?: string;
    targetLabel?: string;
    statusCode: number;
    status: AuditStatus;
    severity: AuditSeverity;
    ip?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface AuditLogStats {
    totalEvents: number;
    securityAlerts: number;
    roleChanges: number;
    failedLogins: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
}

export interface GetAuditLogsParams {
    search?: string;
    severity?: AuditSeverity | "";
    status?: AuditStatus | "";
    resource?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export interface GetAuditLogsResponse {
    success: boolean;
    data: AuditLog[];
    stats: AuditLogStats;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface AuditLogResponse {
    success: boolean;
    data: AuditLog;
}

export const auditLogApi = baseQuery.injectEndpoints({
    endpoints: (builder) => ({
        getAuditLogs: builder.query<
            GetAuditLogsResponse,
            GetAuditLogsParams | void
        >({
            query: (params) => {
                const queryString = params
                    ? new URLSearchParams(
                          Object.entries(params)
                              .filter(
                                  ([, value]) =>
                                      value !== undefined && value !== "",
                              )
                              .map(([key, value]) => [key, String(value)]),
                      ).toString()
                    : "";
                return `/audit-logs${queryString ? `?${queryString}` : ""}`;
            },
            providesTags: ["AuditLog"],
        }),
        getAuditLogById: builder.query<AuditLogResponse, string>({
            query: (id) => `/audit-logs/${id}`,
            providesTags: (_result, _error, id) => [{ type: "AuditLog", id }],
        }),
    }),
});

export const {
    useGetAuditLogsQuery,
    useLazyGetAuditLogsQuery,
    useGetAuditLogByIdQuery,
} = auditLogApi;
