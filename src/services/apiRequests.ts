import axios from "../lib/axios";
import { normalisePagination } from "./pagination";

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
  code?: string;
  name?: string;
  asset_id?: string;
  dicom_aet?: string | null;
  facility_id?: string;
  facility?: { id?: string; name?: string } | null;
  status?: string;
}

export interface MedicalRequestBookedService {
  id?: string;
  booking_id?: string;
  contract_service_id?: string;
  equipment_id?: string;
  scheduled_date?: string;
  tariff?: string;
  cash?: string;
  sha?: string;
  other_insurance?: string;
  vendor_share?: string;
  facility_share?: string;
  status?: string;
  booking?: {
    id?: string;
    patient_id?: string;
    patient?: { id?: string; name?: string } | null;
  } | null;
}

/**
 * An EMR imaging order.
 *
 * The live API now returns enriched fields (patient_name, facility_name,
 * equipment_code) alongside nested equipment / booked_service objects.
 */
export interface MedicalRequest {
  id?: string;
  internal_request_id?: string;
  request_id?: string;

  // MWL / HL7 order fields
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
  result_received_at?: string | null;
  result_body?: string | null;
  result_observations?: string | null;
  specimen_type?: string | null;
  specimen_received_at?: string | null;
  equipment_id?: string;
  /**
   * Nullable: a probe worklist has no booked service, and the presentation
   * layer sends `booking` and `service` as null for it.
   */
  booked_service_id?: string | null;
  /** A probe worklist raised by an MWL test rather than a real order. */
  is_test?: boolean;
  orthanc_worklist_id?: string | null;
  referring_physician?: string | null;
  performing_technologist?: string | null;
  interpreting_physician?: string | null;
  has_critical_values?: boolean;
  status_reason?: string | null;

  // Study metadata captured from the DICOM result callback. `performed_at`
  // is the acquisition time from PerformedProcedureStepStart, which is not
  // always the same day as `study_date`. The counts and pixel descriptors are
  // read back from Orthanc when the callback cannot supply them, so they may
  // be absent rather than zero.
  study_instance_uid?: string | null;
  series_instance_uid?: string | null;
  study_date?: string | null;
  study_time?: string | null;
  performed_at?: string | null;
  series_count?: number | null;
  instance_count?: number | null;
  manufacturer?: string | null;
  station_name?: string | null;
  body_part?: string | null;
  pixel_metadata?: Record<string, unknown> | null;
  /** The machine credited with performing the study. */
  performed_by_ae_title?: string | null;
  performed_by_equipment_id?: string | null;

  // HL7 raw data
  hl7_message_control_id?: string | null;
  hl7_raw_request?: string | null;
  hl7_raw_response?: string | null;
  hl7_errors?: string | null;

  // Patient / facility — convenience flat fields from API
  patient_id?: string;
  patient_name?: string;
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
  equipment_code?: string;

  // Enriched nested objects — API now sends single equipment object
  equipment?: MedicalRequestEquipment | null;
  booked_service?: MedicalRequestBookedService | null;

  // Claim / payer
  claim_id?: string | null;
  payor?: string | null;
  preauth_code?: string | null;

  status: MedicalRequestStatus | string;
  status_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** The identifier to route by — accession number is what the live API keys on. */
export const requestIdentifier = (r: MedicalRequest): string =>
  r.request_id || r.accession_number || r.internal_request_id || r.id || "";

/** Display label for the request, preferring the accession number. */
export const requestLabel = (r: MedicalRequest): string =>
  r.accession_number || r.request_id || r.internal_request_id || "-";

/** Patient name — uses the convenience flat field the API now sends. */
export const requestPatientName = (r: MedicalRequest): string => {
  if (r.patient_name) return r.patient_name;
  if (r.patient?.name) return r.patient.name;
  if (r.booked_service?.booking?.patient?.name) return r.booked_service.booking.patient.name;
  const full = [r.patient_first_name, r.patient_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || "-";
};

/** Facility name — uses the convenience flat field the API now sends. */
export const requestFacility = (r: MedicalRequest): string =>
  r.facility_name ||
  r.facility?.name ||
  (r.equipment && "facility" in r.equipment ? r.equipment.facility?.name : undefined) ||
  r.institution_name ||
  "-";

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
  /** The addressed facility's KEPH level, as stored: "Level 4". */
  keph_level?: string;
  facility_name?: string;
  /** Vendor of the named machine, or of the contract when only a facility is named. */
  vendor_id?: string;
  /** `7d`, `30d`, `90d`, `12m`, `this_month`, `this_year`. */
  period?: string;
  /** Explicit range; overrides `period`. */
  from?: string;
  to?: string;
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
    pagination: normalisePagination(response.data.pagination),
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
  /** The facility's KEPH level, as stored: "Level 4". Case-insensitive. */
  keph_level?: string;
  days?: number;
}): Promise<RequestStatsSummary> => {
  const response = await axios.get<
    { data: RequestStatsSummary } | RequestStatsSummary
  >("/requests/stats/summary", { params });
  const body = response.data as { data?: RequestStatsSummary };
  return (body.data ?? response.data) as RequestStatsSummary;
};
