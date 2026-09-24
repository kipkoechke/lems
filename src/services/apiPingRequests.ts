import axios from "../lib/axios";
import { normalisePagination, NormalisedPagination } from "./pagination";

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

// ============================================================
// Device activity log — /equipment/ping-requests/activity
// ============================================================

/**
 * Every inbound device event, in arrival order.
 *
 * This is an arrival log, not a queue: nothing is approved or created from it.
 * Rows carry the bare name the device announced (`source_name`), and the link
 * to a known equipment record is best-effort — an unlinked row is normal, not
 * an error.
 */
export type DeviceActivityType = "connect" | "worklist_pull" | "study_send";

export interface DeviceActivityEquipment {
  id: string;
  code?: string;
  name?: string;
}

export interface DeviceActivityFacility {
  id: string;
  name: string;
  fr_code?: string;
}

export interface DeviceActivity {
  id: string;
  activity_type: DeviceActivityType;
  source_name: string;
  device_name?: string | null;
  ip_addr?: string | null;
  port?: number | null;
  modality?: string | null;
  equipment?: DeviceActivityEquipment | null;
  facility?: DeviceActivityFacility | null;
  context?: Record<string, unknown> | null;
  occurred_at: string;
}

export interface DeviceActivityParams {
  activity_type?: DeviceActivityType;
  source_name?: string;
  equipment_id?: string;
  /** Tri-state: omit for both, true for ever-seen, false for never-seen. */
  linked?: boolean;
  period?: PeriodPreset;
  from?: string;
  to?: string;
  /** 1–100, default 50. */
  page_size?: number;
  page?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface DeviceActivityResponse {
  data: DeviceActivity[];
  pagination: NormalisedPagination;
  available_filters?: {
    activity_type?: FilterOption[];
    period?: FilterOption[];
  };
}

/** The shared period presets, used across activity, requests and dashboard. */
export type PeriodPreset =
  | "7d"
  | "30d"
  | "90d"
  | "12m"
  | "this_month"
  | "this_year";

export const PERIOD_PRESETS: FilterOption[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
  { value: "this_month", label: "This Month" },
  { value: "this_year", label: "This Year" },
];

export const ACTIVITY_TYPES: { value: DeviceActivityType; label: string }[] = [
  { value: "connect", label: "Connect" },
  { value: "worklist_pull", label: "Worklist Pull" },
  { value: "study_send", label: "Study Send" },
];

// GET /equipment/ping-requests/activity
// `/dicom/events/ping-events` serves the same log; this is the preferred route.
export const getDeviceActivity = async (
  params: DeviceActivityParams = {},
): Promise<DeviceActivityResponse> => {
  const response = await axios.get("/equipment/ping-requests/activity", {
    // `linked` is tri-state, so it is only sent when explicitly set.
    params: {
      ...params,
      linked: params.linked === undefined ? undefined : String(params.linked),
    },
  });

  return {
    data: response.data?.data ?? [],
    pagination: normalisePagination(
      response.data?.pagination,
      params.page_size ?? 50,
    ),
    available_filters: response.data?.available_filters,
  };
};

// ============================================================
// Pending installation — /equipment/ping-requests/pending-installation
// ============================================================

/**
 * Equipment awaiting installation.
 *
 * Devices discovered on the network are created unowned — `vendor` and
 * `facility` are legitimately null — and claimed by an admin through
 * `POST /dicom/equipment/{id}/configure`, which now takes a facility too.
 */
export interface PendingInstallationEquipment {
  id: string;
  code: string;
  name: string;
  ae_title?: string | null;
  status: string;
  status_label?: string;
  vendor?: { id: string; name: string; code?: string } | null;
  facility?: DeviceActivityFacility | null;
  discovered?: { ip?: string | null; port?: number | null } | null;
  hl7_host?: string | null;
  dicom_port?: number | null;
  last_seen_at?: string | null;
  created_at?: string;
}

export interface PendingInstallationParams {
  /** Only equipment with neither a vendor nor a facility. */
  unassigned_only?: boolean;
  /** 1–100, default 50. */
  page_size?: number;
  page?: number;
}

export interface PendingInstallationResponse {
  data: PendingInstallationEquipment[];
  pagination: NormalisedPagination;
}

// GET /equipment/ping-requests/pending-installation
export const getPendingInstallation = async (
  params: PendingInstallationParams = {},
): Promise<PendingInstallationResponse> => {
  const response = await axios.get(
    "/equipment/ping-requests/pending-installation",
    { params },
  );

  return {
    data: response.data?.data ?? [],
    pagination: normalisePagination(
      response.data?.pagination,
      params.page_size ?? 50,
    ),
  };
};
