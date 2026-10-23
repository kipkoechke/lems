import axios from "../lib/axios";
import { normaliseFilterBlock } from "@/lib/filterOptions";
import { normalisePagination, NormalisedPagination } from "./pagination";
import {
  getLastResultByFacility,
  type FilterOption,
} from "./apiFacilityReadiness";
import { getEquipmentUtilization } from "./apiEquipmentUtilization";

/**
 * Facility ranking (`GET /admin/facility-ranking`).
 *
 * Facilities ranked by booking volume, with their status breakdown, completion
 * rate, and the non-SHA studies performed on their equipment with no order
 * behind them.
 *
 * `completion_rate` is completed ÷ (total − cancelled): a cancelled booking was
 * never expected to complete, so it is not counted against the facility.
 * `pending` is `pending_otp + active`.
 */

export interface RankingFacility {
  id: string;
  name: string;
  fr_code?: string;
  keph_level?: string;
  facility_type?: string;
  county?: { id: string; name: string; code?: string } | null;
}

export interface RankingBookings {
  total: number;
  /** `pending_otp` plus `active`. */
  pending: number;
  completed: number;
  cancelled: number;
  by_status?: Record<string, number>;
  by_source?: Record<string, number>;
  completion_rate: number;
  patients: number;
  last_booking_at?: string | null;
}

/**
 * The facility's SHA claim facts.
 *
 * `submission_rate` is submitted ÷ total bookings; `verification_rate` is
 * verified ÷ **submitted** — not ÷ bookings. The second asks "of the claims we
 * sent, how many did SHA answer for", which is why it is a percentage of a
 * different denominator than the first.
 */
export interface RankingShaClaims {
  /** Bookings whose claim was sent to SHA — the ones carrying a `claim_id`. */
  submitted: number;
  /** Bookings SHA has answered a payer's query about. */
  verified: number;
  submission_rate: number;
  verification_rate: number;
}

export interface RankingRow {
  /** Assigned over the whole filtered set, so it is stable across pages. */
  rank: number;
  facility: RankingFacility;
  bookings: RankingBookings;
  /** Absent on deployments that do not report the claim facts yet. */
  sha?: RankingShaClaims;
  non_sha_studies?: { total: number; last_received_at?: string | null };
}

export interface FacilityRankingSummary {
  facilities: number;
  total_bookings: number;
  completed: number;
  pending: number;
  cancelled: number;
  completion_rate: number;
  patients: number;
  non_sha_studies: number;
  /** Bookings across the ranking whose claim was sent to SHA. */
  sha_submitted?: number;
  /** Bookings across the ranking SHA has answered a payer's query about. */
  sha_verified?: number;
  /** Submitted ÷ total bookings, for the whole filtered set. */
  sha_submission_rate?: number;
  /** Verified ÷ submitted, for the whole filtered set. */
  sha_verification_rate?: number;
  top_facility?: { id: string; name: string; total_bookings: number } | null;
}

export type FacilityRankingSortBy =
  | "total_bookings"
  | "patients"
  | "completed"
  | "completion_rate"
  | "cancelled"
  | "non_sha_studies"
  | "sha_submitted"
  | "sha_verified"
  | "sha_submission_rate"
  | "sha_verification_rate";

export interface FacilityRankingParams {
  /** Applies to bookings' created_at and studies' received_at; default all time. */
  period?: string;
  county_id?: string;
  facility_id?: string;
  facility_type?: string;
  search?: string;
  /** Facility KEPH level, as stored: "Level 4". Case-insensitive. */
  keph_level?: string;
  is_active?: boolean;
  sort_by?: FacilityRankingSortBy;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface FacilityRankingResponse {
  /** Counts every facility in the ranking, not just this page. */
  summary: FacilityRankingSummary;
  data: RankingRow[];
  pagination: NormalisedPagination;
  available_filters?: Record<string, FilterOption[]>;
}

const EMPTY_SUMMARY: FacilityRankingSummary = {
  facilities: 0,
  total_bookings: 0,
  completed: 0,
  pending: 0,
  cancelled: 0,
  completion_rate: 0,
  patients: 0,
  non_sha_studies: 0,
};

// GET /admin/facility-ranking
export const getFacilityRanking = async (
  params: FacilityRankingParams = {},
): Promise<FacilityRankingResponse> => {
  const response = await axios.get("/admin/facility-ranking", {
    params: {
      ...params,
      is_active:
        params.is_active === undefined ? undefined : String(params.is_active),
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

export const RANKING_SORT_OPTIONS: {
  value: FacilityRankingSortBy;
  label: string;
}[] = [
  { value: "total_bookings", label: "Total bookings" },
  { value: "patients", label: "Patients" },
  { value: "completed", label: "Completed" },
  { value: "completion_rate", label: "Completion rate" },
  { value: "cancelled", label: "Cancelled" },
  { value: "non_sha_studies", label: "Non-SHA studies" },
  { value: "sha_submitted", label: "Claims submitted" },
  { value: "sha_verified", label: "Claims verified" },
  { value: "sha_submission_rate", label: "Submission rate" },
  { value: "sha_verification_rate", label: "Verification rate" },
];

/**
 * Every page of the ranking for these filters.
 *
 * The page size is the API's maximum, so a full ranking is a handful of
 * requests: a report, or an order the API cannot apply, needs all of it.
 */
export const getAllFacilityRanking = async (
  params: FacilityRankingParams,
): Promise<{
  rows: RankingRow[];
  summary: FacilityRankingSummary | undefined;
}> => {
  const rows: RankingRow[] = [];
  let summary: FacilityRankingSummary | undefined;
  let page = 1;
  let lastPage = 1;

  do {
    const response = await getFacilityRanking({
      ...params,
      per_page: 100,
      page,
    });
    summary = summary ?? response.summary;
    rows.push(...response.data);
    lastPage = response.pagination?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);

  return { rows, summary };
};

// ── Machines ─────────────────────────────────────────────────────────────

/**
 * The state of a facility's machines: how many are linked, live, pulling
 * worklists and sending results, and when one last sent a result back.
 *
 * The ranking API does not report this yet, so it is put together from two
 * reports, each used for what it gets right:
 *
 * - The four counts come from equipment utilization, which carries them per
 *   machine with its facility and agrees with the dashboard. Readiness
 *   carries them too, but its own summary contradicts its rows — see
 *   `getLastResultByFacility`.
 *   Machines not yet assigned to a facility (discovered devices awaiting
 *   installation) belong to no row, so a machine live on the network can
 *   still leave every facility reading "0 live".
 * - The last result date comes from readiness, the only report with it.
 *
 * Limits, which the screens state rather than hide:
 *
 * - "Live" is right now and the rest are "ever", so none of it follows the
 *   ranking's period filter. A count of results would need a period, so
 *   none is shown.
 * - Decommissioned machines are left out of every count. A machine taken
 *   out of service is not one the facility can be expected to link, and
 *   counting it would leave the facility reading "2 of 3 linked" forever.
 * - A facility with no machines in service has no entry.
 */
export interface FacilityMachines {
  /** Machines in service at the facility. */
  total: number;
  /** Have reached VEMS at least once. */
  linked: number;
  /** Connected right now. */
  live: number;
  /** Have actually pulled a worklist. */
  worklist: number;
  /** Have returned at least one study. */
  sending: number;
  /** The most recent study any of its machines sent back. */
  lastResultAt: string | null;
}

/** Every facility's machine state, keyed by facility id. */
export const getFacilityMachines = async (): Promise<
  Record<string, FacilityMachines>
> => {
  const machines: Record<string, FacilityMachines> = {};

  const walkUtilization = async () => {
    let page = 1;
    let lastPage = 1;
    do {
      const response = await getEquipmentUtilization({ per_page: 100, page });
      lastPage = response.pagination?.last_page ?? 1;

      for (const row of response.data) {
        if (!row.facility || row.equipment.status === "decommissioned") {
          continue;
        }
        const facts = (machines[row.facility.id] ??= {
          total: 0,
          linked: 0,
          live: 0,
          worklist: 0,
          sending: 0,
          lastResultAt: null,
        });
        facts.total += 1;
        if (row.linked) facts.linked += 1;
        if (row.live) facts.live += 1;
        if (row.pulling_worklist) facts.worklist += 1;
        if (row.sending_results) facts.sending += 1;
      }

      page += 1;
    } while (page <= lastPage);
  };

  const [, lastResult] = await Promise.all([
    walkUtilization(),
    getLastResultByFacility(),
  ]);

  for (const [facilityId, sentAt] of Object.entries(lastResult)) {
    const facts = machines[facilityId];
    if (!facts) continue;
    facts.lastResultAt = sentAt;
    // A study on record means at least one machine has sent, even where the
    // utilization flag has not caught up.
    facts.sending = Math.max(facts.sending, 1);
  }

  return machines;
};

/**
 * Orders the ranking can be read in. Most are the API's own; the two below
 * are applied here, from the readiness report, until the ranking API can
 * sort by them itself.
 */
export const CLIENT_ORDERS = [
  { value: "machines_linked", label: "Machines linked" },
  { value: "last_result", label: "Last result sent" },
] as const;

export type ClientOrder = (typeof CLIENT_ORDERS)[number]["value"];
export type RankingOrder = FacilityRankingSortBy | ClientOrder;

export const RANKING_ORDER_OPTIONS: { value: RankingOrder; label: string }[] = [
  ...RANKING_SORT_OPTIONS,
  ...CLIENT_ORDERS,
];

export const isClientOrder = (order: RankingOrder): order is ClientOrder =>
  CLIENT_ORDERS.some((option) => option.value === order);

/**
 * Orders only the PDF offers. Results back is counted by walking every
 * booking, which is fine for a report someone waits for and too slow for a
 * page that re-sorts on every click.
 */
export const REPORT_ONLY_ORDERS = [
  { value: "results_back", label: "Results back" },
] as const;

export type ReportOrder =
  RankingOrder | (typeof REPORT_ONLY_ORDERS)[number]["value"];

export type RankingRowWithMachines = RankingRow & {
  /** Absent when the facility has no machines in service. */
  machines?: FacilityMachines;
};

export const withMachines = (
  rows: RankingRow[],
  machines: Record<string, FacilityMachines> | undefined,
): RankingRowWithMachines[] =>
  rows.map((row) => {
    const facts = machines?.[row.facility.id];
    return { ...row, machines: facts?.total ? facts : undefined };
  });

const resultTime = (row: RankingRowWithMachines): number =>
  row.machines?.lastResultAt
    ? new Date(row.machines.lastResultAt.replace(" ", "T")).getTime() || 0
    : 0;

/** Share of in-service machines linked; -1 puts "no machines" last. */
const linkedShare = (row: RankingRowWithMachines): number =>
  row.machines ? row.machines.linked / row.machines.total : -1;

/**
 * The browser-side orders. In both, a facility with nothing to show falls to
 * the bottom still in booking order, so the busiest of them leads that group
 * — those are the ones worth chasing first. Ranks are reassigned to the new
 * order.
 *
 * - Last result sent: most recent first; never sent, then no machines, last.
 * - Machines linked: the share of a facility's machines that are linked, a
 *   share rather than a count so a facility with one machine linked of one
 *   ranks above one with two of five. More machines linked breaks a tie.
 */
export const applyClientOrder = (
  order: ClientOrder,
  rows: RankingRowWithMachines[],
): RankingRowWithMachines[] =>
  [...rows]
    .sort((a, b) => {
      const primary =
        order === "last_result"
          ? resultTime(b) - resultTime(a)
          : linkedShare(b) - linkedShare(a) ||
            (b.machines?.linked ?? 0) - (a.machines?.linked ?? 0);
      return primary || b.bookings.total - a.bookings.total;
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
