import axios from "../lib/axios";
import { normaliseFilterBlock } from "@/lib/filterOptions";
import { normalisePagination, NormalisedPagination } from "./pagination";
import type { FilterOption } from "./apiFacilityReadiness";

/**
 * Equipment utilization (`GET /admin/equipment-utilization`).
 *
 * One row per machine, counting what it has actually done: worklists raised
 * against it, MWL queries it pulled, studies it returned, and studies it
 * returned with no VEMS order behind them. It is the volume view of the same
 * estate the readiness report judges, so every machine matching the filters
 * appears — including the ones with all-zero counts, which is the point of the
 * `linked` / `live` / `pulling_worklist` / `sending_results` filters: they
 * exist to hide idle kit, not to hide it by default.
 */

export interface UtilizationEquipment {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  /** Human label for `category`, e.g. "CT Scanner". */
  category_label?: string | null;
  modality?: string | null;
  status: string;
  status_label?: string;
  /** Connected to VEMS right now. */
  is_connected: boolean;
  last_seen_at?: string | null;
}

export interface UtilizationFacility {
  id: string;
  name: string;
  fr_code?: string | null;
}

export interface UtilizationVendor {
  id: string;
  name: string;
  code?: string | null;
}

export interface EquipmentUtilizationRow {
  equipment: UtilizationEquipment;
  /** The DICOM AE title the machine identifies itself with. */
  ae_title?: string | null;
  /** `null` when the machine is not mapped to a facility. */
  facility?: UtilizationFacility | null;
  /** `null` when the machine is not mapped to a vendor. */
  vendor?: UtilizationVendor | null;
  /** Has reached VEMS at least once. */
  linked: boolean;
  /** Connected right now. */
  live: boolean;
  /** Production worklists raised against the machine (test probes excluded). */
  worklist_count: number;
  /** MWL (C-FIND) queries the machine pulled. */
  pulled_count: number;
  /** Worklists for this machine that came back as a study. */
  study_results_sent: number;
  /** Studies sent with no VEMS order behind them. */
  non_sha_sent_count: number;
  last_seen_at?: string | null;
  /** `study_results_sent ÷ worklist_count × 100`, one decimal; `0` with no worklists. */
  conversion_rate: number;
}

export interface EquipmentUtilizationSummary {
  /** Machines matching the filters — the whole set, not the page. */
  equipment: number;
  by_state?: { linked?: number; live?: number };
  worklist_count: number;
  pulled_count: number;
  study_results_sent: number;
  non_sha_sent_count: number;
  conversion_rate: number;
}

export type EquipmentUtilizationSortBy =
  | "worklist_count"
  | "pulled_count"
  | "study_results_sent"
  | "non_sha_sent_count"
  | "conversion_rate"
  | "last_seen_at"
  | "name";

export type SortOrder = "asc" | "desc";

export interface EquipmentUtilizationParams {
  vendor_id?: string;
  facility_id?: string;
  /** `true` = seen on the network at least once. Tri-state: only sent when set. */
  linked?: boolean;
  /** `true` = connected right now. */
  live?: boolean;
  /** `true` = has pulled a worklist. */
  pulling_worklist?: boolean;
  /** `true` = has returned a study. */
  sending_results?: boolean;
  /** Defaults to `worklist_count` on the API. */
  sort_by?: EquipmentUtilizationSortBy;
  /** Defaults to `desc`. */
  sort_order?: SortOrder;
  /** Machines per page, 1–100. */
  per_page?: number;
  page?: number;
}

export interface EquipmentUtilizationResponse {
  summary: EquipmentUtilizationSummary;
  data: EquipmentUtilizationRow[];
  pagination: NormalisedPagination;
  available_filters?: Record<string, FilterOption[]>;
}

const EMPTY_SUMMARY: EquipmentUtilizationSummary = {
  equipment: 0,
  worklist_count: 0,
  pulled_count: 0,
  study_results_sent: 0,
  non_sha_sent_count: 0,
  conversion_rate: 0,
};

/** The API reads booleans as the strings "true" / "false". */
const triState = (value?: boolean) => (value === undefined ? undefined : String(value));

// GET /admin/equipment-utilization
export const getEquipmentUtilization = async (
  params: EquipmentUtilizationParams = {},
): Promise<EquipmentUtilizationResponse> => {
  const response = await axios.get("/admin/equipment-utilization", {
    params: {
      ...params,
      linked: triState(params.linked),
      live: triState(params.live),
      pulling_worklist: triState(params.pulling_worklist),
      sending_results: triState(params.sending_results),
    },
  });

  return {
    summary: response.data?.summary ?? EMPTY_SUMMARY,
    data: response.data?.data ?? [],
    pagination: normalisePagination(
      response.data?.pagination,
      params.per_page ?? 20,
    ),
    available_filters: normaliseFilterBlock(response.data?.filters?.available),
  };
};

export const UTILIZATION_SORT_OPTIONS: FilterOption[] = [
  { value: "worklist_count", label: "Worklist count" },
  { value: "pulled_count", label: "Pulled (query) count" },
  { value: "study_results_sent", label: "Study results sent" },
  { value: "non_sha_sent_count", label: "Non-SHA sent" },
  { value: "conversion_rate", label: "Conversion rate" },
  { value: "last_seen_at", label: "Last seen" },
  { value: "name", label: "Name" },
];

export const SORT_ORDER_OPTIONS: FilterOption[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

// The four tri-state filters. "Linked"/"Live" keep the same meaning here as
// they do on the equipment listings and the readiness report: linked is "has
// ever reached VEMS", live is "connected right now".
export const LINKED_OPTIONS: FilterOption[] = [
  { value: "true", label: "Linked" },
  { value: "false", label: "Not linked" },
];

export const LIVE_OPTIONS: FilterOption[] = [
  { value: "true", label: "Live" },
  { value: "false", label: "Not connected" },
];

export const PULLING_WORKLIST_OPTIONS: FilterOption[] = [
  { value: "true", label: "Pulling worklists" },
  { value: "false", label: "Never pulled a worklist" },
];

export const SENDING_RESULTS_OPTIONS: FilterOption[] = [
  { value: "true", label: "Sending results" },
  { value: "false", label: "Never sent results" },
];
