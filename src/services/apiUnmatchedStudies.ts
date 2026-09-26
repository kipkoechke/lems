import axios from "../lib/axios";
import { normalisePagination, NormalisedPagination } from "./pagination";

/**
 * Non-SHA studies — studies that reached Orthanc with no VEMS order behind
 * them: a walk-in, a private patient, a machine used outside the SHA workflow,
 * or one that sends no accession number at all.
 *
 * These used to be rejected and lost. They are now kept and attributed to the
 * machine that reported them (equipment → vendor → facility), which is why the
 * same listing is served at three role-scoped paths.
 *
 * Attribution depends on `station_ae_title`, the only field that can be matched
 * against a piece of equipment — `station_name` is a DICOM display name and is
 * not unique. A study whose AE title matches nothing is kept as
 * `attributed: false` and is visible to admins only.
 */

export interface UnmatchedStudyEquipment {
  id: string;
  code?: string;
  name?: string;
  ae_title?: string;
}

export interface UnmatchedStudyVendor {
  id: string;
  name: string;
  code?: string;
}

export interface UnmatchedStudyFacility {
  id: string;
  name: string;
  fr_code?: string;
}

export interface UnmatchedStudyPixelMetadata {
  rows?: number;
  columns?: number;
  bits_allocated?: number;
  bits_stored?: number;
  window_center?: number | string;
  window_width?: number | string;
  [key: string]: unknown;
}

export interface UnmatchedStudy {
  id: string;
  received_at: string;
  accession_number?: string | null;
  study_instance_uid?: string | null;
  series_instance_uid?: string | null;
  patient_id?: string | null;
  modality?: string | null;
  study_description?: string | null;
  body_part?: string | null;
  institution_name?: string | null;
  manufacturer?: string | null;
  station_name?: string | null;
  referring_physician?: string | null;
  study_date?: string | null;
  study_time?: string | null;
  /** When the study was actually acquired, which need not be `study_date`. */
  performed_at?: string | null;
  series_count?: number | null;
  instance_count?: number | null;
  pixel_metadata?: UnmatchedStudyPixelMetadata | null;
  /** The machine's registered identity — what attribution is matched on. */
  source_ae_title?: string | null;
  remote_ip?: string | null;
  attributed: boolean;
  equipment?: UnmatchedStudyEquipment | null;
  vendor?: UnmatchedStudyVendor | null;
  facility?: UnmatchedStudyFacility | null;
}

export interface UnmatchedStudiesSummary {
  total: number;
  this_month: number;
  /** Studies whose AE title matched no equipment. */
  unattributed: number;
  latest_received_at?: string | null;
}

export interface UnmatchedStudiesParams {
  modality?: string;
  equipment_id?: string;
  vendor_id?: string;
  facility_id?: string;
  /** The attributed facility's KEPH level, as stored: "Level 4". */
  keph_level?: string;
  /** Accession, study UID, patient id, station name, AE title or description. */
  search?: string;
  attributed?: boolean;
  period?: string;
  from?: string;
  to?: string;
  page_size?: number;
  page?: number;
}

export interface UnmatchedStudiesFilterOption {
  value: string;
  label: string;
}

/**
 * The options the caller may actually use.
 *
 * `modality` lists only what is present in the studies that caller can see, so
 * nobody is offered a filter that would come back empty. Equipment, vendor and
 * facility are absent by design — those are chosen from their own listings.
 */
export interface UnmatchedStudiesAvailableFilters {
  modality?: UnmatchedStudiesFilterOption[];
  attributed?: UnmatchedStudiesFilterOption[];
  period?: UnmatchedStudiesFilterOption[];
}

export interface UnmatchedStudiesResponse {
  summary: UnmatchedStudiesSummary;
  data: UnmatchedStudy[];
  pagination: NormalisedPagination;
  available_filters?: UnmatchedStudiesAvailableFilters;
}

/**
 * Which listing a role may call. The three return the same shape over
 * different populations, so the caller picks the scope and nothing else
 * changes.
 */
export type UnmatchedStudiesScope = "admin" | "vendor" | "facility";

const SCOPE_PATHS: Record<UnmatchedStudiesScope, string> = {
  admin: "/admin/studies/unmatched",
  vendor: "/vendor/studies/unmatched",
  facility: "/facility/studies/unmatched",
};

export const getUnmatchedStudies = async (
  scope: UnmatchedStudiesScope,
  params: UnmatchedStudiesParams = {},
): Promise<UnmatchedStudiesResponse> => {
  const response = await axios.get(SCOPE_PATHS[scope], {
    // `attributed` is tri-state, so it is only sent when explicitly set.
    params: {
      ...params,
      attributed:
        params.attributed === undefined ? undefined : String(params.attributed),
    },
  });

  return {
    summary: response.data?.summary ?? {
      total: 0,
      this_month: 0,
      unattributed: 0,
    },
    data: response.data?.data ?? [],
    pagination: normalisePagination(
      response.data?.pagination,
      params.page_size ?? 25,
    ),
    available_filters: response.data?.available_filters,
  };
};
