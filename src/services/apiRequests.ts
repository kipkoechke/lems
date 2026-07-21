import axios from "../lib/axios";

export type MedicalRequestStatus =
  | "pending"
  | "sent"
  | "acknowledged"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

// `sent` and `acknowledged` are the HL7 lifecycle states the live API returns.
export const REQUEST_STATUS_OPTIONS: {
  value: MedicalRequestStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "acknowledged", label: "Acknowledged" },
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

/**
 * An EMR imaging order.
 *
 * The live endpoint returns the HL7/MWL worklist shape (`accession_number`,
 * `study_description`, `procedure_code`, `scheduled_at`, ids rather than nested
 * objects). The reference documents a richer shape with patient/facility names
 * inlined, which this deployment does not send — hence the accessors below.
 * Reading `request_id`/`patient_first_name`/`facility_name` directly renders
 * every row as "-".
 */
export interface MedicalRequest {
  id?: string;
  internal_request_id?: string;
  request_id?: string;

  // Live MWL-order fields
  accession_number?: string;
  filler_order_number?: string | null;
  hl7_message_type?: string | null;
  procedure_code?: string | null;
  study_description?: string | null;
  priority?: string | null;
  order_control?: string | null;
  scheduled_at?: string | null;
  sent_at?: string | null;
  acknowledged_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  result_status?: string | null;
  equipment_id?: string;
  booked_service_id?: string;
  orthanc_worklist_id?: string | null;
  referring_physician?: string | null;
  performing_technologist?: string | null;
  interpreting_physician?: string | null;
  has_critical_values?: boolean;

  // Documented / enriched fields — may be absent.
  patient_id?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_mrn?: string | null;
  patient?: { id?: string; name?: string; identification_no?: string } | null;
  date_of_birth?: string | null;
  sex?: string | null;
  modality?: string | null;
  description?: string | null;
  institution_name?: string | null;
  procedures?: string[];
  facility_id?: string;
  facility_name?: string | null;
  facility?: { id?: string; name?: string; fr_code?: string } | null;
  claim_id?: string | null;
  payor?: string | null;
  preauth_code?: string | null;
  status: MedicalRequestStatus | string;
  status_message?: string | null;
  equipment?: MedicalRequestEquipment[] | MedicalRequestEquipment | null;
  created_at?: string;
  updated_at?: string;
}

/** The identifier to route by — accession number is what the live API keys on. */
export const requestIdentifier = (r: MedicalRequest): string =>
  r.request_id || r.accession_number || r.internal_request_id || r.id || "";

/** Display label for the request, preferring the accession number. */
export const requestLabel = (r: MedicalRequest): string =>
  r.accession_number || r.request_id || r.internal_request_id || "-";

/** Patient name from whichever shape the API returned. */
export const requestPatientName = (r: MedicalRequest): string => {
  if (r.patient?.name) return r.patient.name;
  const full = [r.patient_first_name, r.patient_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || "-";
};

/** Facility name, falling back through the shapes then the raw id. */
export const requestFacility = (r: MedicalRequest): string =>
  r.facility?.name || r.facility_name || r.institution_name || "-";

/**
 * What was ordered. The live payload describes a single study rather than a
 * list of procedure names.
 */
export const requestProcedure = (r: MedicalRequest): string => {
  if (r.procedures?.length) return r.procedures.join(", ");
  return r.study_description || r.description || r.procedure_code || "-";
};

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
