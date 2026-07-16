import axios from "../lib/axios";

export type AeTitleSource = "machine_ping" | "system_generated" | "custom";

export interface PingRequest {
  id: string;
  ae_title: string;
  ip_addr: string;
  port: number;
  request_type?: string;
  modality?: string | null;
  device_name_ae_title?: string | null;
  machine_features?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  equipment_id?: string | null;
  equipment?: { id: string; code?: string; name?: string } | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PingRequestDecision {
  approval_reason?: string;
  equipment_id?: string;
  ae_title_source?: AeTitleSource;
  selected_ae_title?: string;
}

const unwrapList = (data: unknown): PingRequest[] => {
  if (Array.isArray(data)) return data as PingRequest[];
  const body = data as { data?: PingRequest[] };
  return body?.data ?? [];
};

// GET /equipment/ping-requests/pending
export const getPendingPingRequests = async (): Promise<PingRequest[]> => {
  const response = await axios.get("/equipment/ping-requests/pending");
  return unwrapList(response.data);
};

// GET /equipment/ping-requests/realtime?since=
export const getRealtimePingRequests = async (
  since?: string,
): Promise<PingRequest[]> => {
  const response = await axios.get("/equipment/ping-requests/realtime", {
    params: since ? { since } : undefined,
  });
  return unwrapList(response.data);
};

// GET /equipment/ping-requests/linked-equipment-ids
export const getLinkedEquipmentIds = async (): Promise<string[]> => {
  const response = await axios.get(
    "/equipment/ping-requests/linked-equipment-ids",
  );
  const data = response.data as { data?: string[] } | string[];
  return Array.isArray(data) ? data : (data.data ?? []);
};

// POST /equipment/ping-requests/{id}/approve
export const approvePingRequest = async (
  pingRequestId: string,
  data: PingRequestDecision = {},
): Promise<unknown> => {
  const response = await axios.post(
    `/equipment/ping-requests/${pingRequestId}/approve`,
    data,
  );
  return response.data;
};

// POST /equipment/ping-requests/{id}/reject
export const rejectPingRequest = async (
  pingRequestId: string,
  data: PingRequestDecision = {},
): Promise<unknown> => {
  const response = await axios.post(
    `/equipment/ping-requests/${pingRequestId}/reject`,
    data,
  );
  return response.data;
};
