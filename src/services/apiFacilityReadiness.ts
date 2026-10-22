import axios from "../lib/axios";
import { normaliseFilterBlock } from "@/lib/filterOptions";
import { normalisePagination, NormalisedPagination } from "./pagination";

/**
 * Facility readiness (`GET /admin/facility-readiness`).
 *
 * The follow-up report: every facility with the equipment installed there,
 * judged on four **evidence-based** checks rather than on how the
 * configuration looks. A machine that is online and correctly configured is
 * still not worklist-ready until a C-FIND has actually been logged against it,
 * and not results-ready until a study has actually come back. That distinction
 * is the point of the report, so the UI must not soften it.
 */

export interface ReadinessChecks {
  /** Has reached VEMS at least once (`last_seen_at` is set). */
  linked: boolean;
  /** Connected right now. */
  live: boolean;
  /** Has actually pulled a worklist — a C-FIND, a test probe, or a real order. */
  worklist_ready: boolean;
  /** Has actually returned a study. */
  results_ready: boolean;
}

export type ReadinessLevel = "ready" | "attention" | "not_ready";

export interface ReadinessNote {
  level: string;
  /**
   * One of: decommissioned, pending_installation, under_maintenance,
   * inactive, never_linked, not_live, no_end_to_end_test,
   * worklist_never_pulled, results_never_returned, non_sha_studies.
   */
  code: string;
  message: string;
}

export interface ReadinessEquipmentTests {
  total: number;
  succeeded: number;
  awaiting_result: number;
  last_tested_at?: string | null;
  last_accession_number?: string | null;
}

export interface ReadinessEquipmentActivity {
  last_seen_at?: string | null;
  connected_at?: string | null;
  last_worklist_pull_at?: string | null;
  last_study_sent_at?: string | null;
  orders_performed?: number;
  results_received?: number;
  unmatched_studies?: number;
}

export interface ReadinessEquipment {
  id: string;
  code: string;
  name: string;
  modality?: string | null;
  status: string;
  status_label?: string;
  ownership_type: "vendor" | "facility";
  vendor?: { id: string; name: string; code?: string } | null;
  dicom?: {
    ae_title?: string | null;
    host?: string | null;
    port?: number | null;
  } | null;
  checks: ReadinessChecks;
  tests?: ReadinessEquipmentTests;
  activity?: ReadinessEquipmentActivity;
  readiness: ReadinessLevel;
  ready: boolean;
  /** How many of the four checks passed. */
  score: number;
  /** One per blocker, most fundamental first. */
  notes?: ReadinessNote[];
}

export interface ReadinessCounts {
  total: number;
  by_ownership?: Record<string, number>;
  by_check?: Record<keyof ReadinessChecks, number>;
  by_readiness?: Record<ReadinessLevel, number>;
}

export interface ReadinessFacility {
  id: string;
  name: string;
  fr_code?: string;
  keph_level?: string;
  facility_type?: string;
  county?: { id: string; name: string; code?: string } | null;
}

export interface FacilityReadinessRow {
  facility: ReadinessFacility;
  summary: ReadinessCounts;
  equipment: ReadinessEquipment[];
}

export interface FacilityReadinessParams {
  county_id?: string;
  facility_id?: string;
  facility_type?: string;
  /** Facility KEPH level, as stored: "Level 4". Case-insensitive. */
  keph_level?: string;
  /** Facility name/FR code, or any of its equipment's name/code/AE title. */
  search?: string;
  vendor_id?: string;
  ownership_type?: "facility" | "vendor";
  status?: string;
  readiness?: ReadinessLevel;
  linked?: boolean;
  is_connected?: boolean;
  /** Facilities per page, 1–100. */
  per_page?: number;
  page?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FacilityReadinessResponse {
  /** Counts every facility matching the filters, not just this page. */
  summary: ReadinessCounts;
  data: FacilityReadinessRow[];
  pagination: NormalisedPagination;
  available_filters?: Record<string, FilterOption[]>;
}

// GET /admin/facility-readiness — paginated by facility.
export const getFacilityReadiness = async (
  params: FacilityReadinessParams = {},
): Promise<FacilityReadinessResponse> => {
  const response = await axios.get("/admin/facility-readiness", {
    // Both booleans are tri-state, so they are only sent when explicitly set.
    params: {
      ...params,
      linked: params.linked === undefined ? undefined : String(params.linked),
      is_connected:
        params.is_connected === undefined
          ? undefined
          : String(params.is_connected),
    },
  });

  return {
    summary: response.data?.summary ?? { total: 0 },
    data: response.data?.data ?? [],
    pagination: normalisePagination(
      response.data?.pagination,
      params.per_page ?? 20,
    ),
    available_filters: normaliseFilterBlock(response.data?.filters?.available),
  };
};

/**
 * When each facility's machines last sent a study back, keyed by facility id,
 * with decommissioned machines left out. Facilities with no machine that has
 * ever sent one are absent.
 *
 * Only the date is read from readiness; the machine counts come from
 * utilization, the source the dashboard uses. On 2026-10-22 readiness's
 * estate summary reported no machine linked while its own rows marked
 * thirty-three, so its checks are not relied on for counting.
 */
export const getLastResultByFacility = async (): Promise<
  Record<string, string>
> => {
  const lastResult: Record<string, string> = {};
  let page = 1;
  let lastPage = 1;

  do {
    const response = await getFacilityReadiness({ per_page: 100, page });
    lastPage = response.pagination?.last_page ?? 1;

    for (const row of response.data) {
      for (const equipment of row.equipment) {
        if (equipment.status === "decommissioned") continue;
        const sentAt = equipment.activity?.last_study_sent_at;
        const current = lastResult[row.facility.id];
        if (sentAt && (!current || toTime(sentAt) > toTime(current))) {
          lastResult[row.facility.id] = sentAt;
        }
      }
    }

    page += 1;
  } while (page <= lastPage);

  return lastResult;
};

/** The API writes "2026-10-22 09:08:00"; Safari will not parse the space. */
export const toTime = (value: string): number =>
  new Date(value.replace(" ", "T")).getTime() || 0;

/** Badge styling per readiness level. */
export const readinessClasses = (level: ReadinessLevel): string => {
  switch (level) {
    case "ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "attention":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-red-50 text-red-700 border-red-200";
  }
};

export const READINESS_LABELS: Record<ReadinessLevel, string> = {
  ready: "Ready",
  attention: "Needs attention",
  not_ready: "Not ready",
};

export const READINESS_OPTIONS: FilterOption[] = (
  ["ready", "attention", "not_ready"] as ReadinessLevel[]
).map((value) => ({ value, label: READINESS_LABELS[value] }));

/** The four checks, in the order they have to be satisfied. */
export const READINESS_CHECKS: {
  key: keyof ReadinessChecks;
  label: string;
  hint: string;
}[] = [
  {
    key: "linked",
    label: "Linked",
    hint: "Has reached VEMS at least once",
  },
  { key: "live", label: "Live", hint: "Connected right now" },
  {
    key: "worklist_ready",
    label: "Worklist",
    hint: "Has actually pulled a worklist — not merely configured to",
  },
  {
    key: "results_ready",
    label: "Results",
    hint: "Has actually sent a study back — not merely configured to",
  },
];
