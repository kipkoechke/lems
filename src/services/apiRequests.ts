import axios from "../lib/axios";

export type MedicalRequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export const REQUEST_STATUS_OPTIONS: {
  value: MedicalRequestStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export interface MedicalRequestEquipment {
  id?: string;
  asset_id?: string;
  name?: string;
  dicom_aet?: string | null;
  status?: string;
}

export interface MedicalRequest {
  id?: string;
  internal_request_id?: string;
  request_id: string;
  patient_id?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_mrn?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
  modality?: string | null;
  description?: string | null;
  institution_name?: string | null;
  procedures?: string[];
  facility_id?: string;
  facility_name?: string | null;
  claim_id?: string | null;
  payor?: string | null;
  preauth_code?: string | null;
  status: MedicalRequestStatus | string;
  status_message?: string | null;
  equipment?: MedicalRequestEquipment[] | MedicalRequestEquipment | null;
  created_at?: string;
  updated_at?: string;
}

export interface MedicalRequestListParams {
  status?: string;
  patient_id?: string;
  patient?: string;
  facility_id?: string;
  facility_name?: string;
  page?: number;
  page_size?: number;
}

export interface MedicalRequestListResponse {
  data: MedicalRequest[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface RequestStatsSummary {
  [key: string]: unknown;
  total?: number;
  pending?: number;
  in_progress?: number;
  completed?: number;
  failed?: number;
  cancelled?: number;
}

export interface CallbackLog {
  id?: string;
  url?: string;
  status_code?: number;
  success?: boolean;
  attempted_at?: string;
  response_body?: string | null;
  [key: string]: unknown;
}

export interface RetargetRequest {
  facility_id: string;
  equipment_id: string;
}

export interface RetargetResponse {
  internal_request_id: string;
  status: string;
  status_message: string;
  facility_id: string;
  equipment_id: string;
  equipment_asset_id?: string;
  equipment_dicom_aet?: string;
}

export interface MwlRegenerateResponse {
  internal_request_id: string;
  status: string;
  status_message: string;
  generated_files?: number;
  queued?: number;
  succeeded?: number;
  failed?: number;
  dead_lettered?: number;
}

// GET /requests
export const getMedicalRequests = async (
  params: MedicalRequestListParams = {},
): Promise<MedicalRequestListResponse> => {
  const response = await axios.get<MedicalRequestListResponse | MedicalRequest[]>(
    "/requests",
    { params },
  );

  if (Array.isArray(response.data)) {
    return { data: response.data };
  }

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

// GET /requests/{request_id}
export const getMedicalRequest = async (
  requestId: string,
): Promise<MedicalRequest> => {
  const response = await axios.get<{ data: MedicalRequest } | MedicalRequest>(
    `/requests/${requestId}`,
  );
  const body = response.data as { data?: MedicalRequest };
  return (body.data ?? response.data) as MedicalRequest;
};

// POST /requests/{request_id}/cancel
export const cancelMedicalRequest = async (
  requestId: string,
): Promise<unknown> => {
  const response = await axios.post(`/requests/${requestId}/cancel`);
  return response.data;
};

// GET /requests/{request_id}/callback-logs
export const getRequestCallbackLogs = async (
  requestId: string,
): Promise<CallbackLog[]> => {
  const response = await axios.get<{ data: CallbackLog[] } | CallbackLog[]>(
    `/requests/${requestId}/callback-logs`,
  );
  return Array.isArray(response.data)
    ? response.data
    : (response.data.data ?? []);
};

// GET /requests/{request_id}/eligible-equipment
export const getEligibleEquipment = async (
  requestId: string,
  facilityId?: string,
): Promise<MedicalRequestEquipment[]> => {
  const response = await axios.get<
    { data: MedicalRequestEquipment[] } | MedicalRequestEquipment[]
  >(`/requests/${requestId}/eligible-equipment`, {
    params: facilityId ? { facility_id: facilityId } : undefined,
  });
  return Array.isArray(response.data)
    ? response.data
    : (response.data.data ?? []);
};

// POST /requests/{request_id}/retarget
export const retargetMedicalRequest = async (
  requestId: string,
  data: RetargetRequest,
): Promise<RetargetResponse> => {
  const response = await axios.post<RetargetResponse>(
    `/requests/${requestId}/retarget`,
    data,
  );
  return response.data;
};

// POST /requests/{request_id}/mwl/regenerate
export const regenerateMwl = async (
  requestId: string,
): Promise<MwlRegenerateResponse> => {
  const response = await axios.post<MwlRegenerateResponse>(
    `/requests/${requestId}/mwl/regenerate`,
  );
  return response.data;
};

// GET /requests/stats/summary
export const getRequestStats = async (params?: {
  facility_id?: string;
  days?: number;
}): Promise<RequestStatsSummary> => {
  const response = await axios.get<
    { data: RequestStatsSummary } | RequestStatsSummary
  >("/requests/stats/summary", { params });
  const body = response.data as { data?: RequestStatsSummary };
  return (body.data ?? response.data) as RequestStatsSummary;
};
