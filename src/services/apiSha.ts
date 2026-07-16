import axios from "../lib/axios";

export interface ShaIntervention {
  id?: string;
  internal_request_id?: string;
  request_id?: string;
  emr_request_id?: string;
  patient_id?: string;
  patient_name?: string;
  id_number?: string | null;
  procedure?: string | null;
  procedure_code?: string | null;
  facility_id?: string;
  facility_name?: string | null;
  equipment?: {
    id?: string;
    name?: string;
    asset_id?: string;
    dicom_aet?: string | null;
  } | null;
  status?: string;
  performed_at?: string | null;
  completed_at?: string | null;
  result?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface ShaInterventionParams {
  patient_id?: string;
  id_number?: string;
  emr_request_id?: string;
  facility_id?: string;
  internal_request_id?: string;
}

// GET /sha/interventions
export const getShaInterventions = async (
  params: ShaInterventionParams = {},
): Promise<ShaIntervention[]> => {
  const response = await axios.get<
    { data: ShaIntervention[] } | ShaIntervention[]
  >("/sha/interventions", { params });
  return Array.isArray(response.data)
    ? response.data
    : (response.data.data ?? []);
};
