interface BaseActivityLog {
  timestamp: number;
  action: string;
  context: string;
  id: number;
  username: string;
  resourceType: string;
  resourceID: string;
  resourceName: string;
}
export interface ActivityLogResponse extends BaseActivityLog {
  payload: string;
}

export interface ActivityLog extends BaseActivityLog {
  payload: string | object;
}

export interface ActivityLogsResponse {
  logs: Array<ActivityLogResponse>;
  totalCount: number;
}

// Activity payload structure for parsed object payloads
export interface ActivityPayload {
  description?: string;
  operation?: string;
  resourceType?: string;
  resourceID?: string;
  resourceName?: string;
  endpoint?: string;
  endpointID?: number;
  success?: boolean;
  error?: string;
  // Additional fields from various handlers
  [key: string]: unknown;
}
