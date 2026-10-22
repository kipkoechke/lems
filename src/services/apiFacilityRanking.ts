import axios from "../lib/axios";
import { normaliseFilterBlock } from "@/lib/filterOptions";
import { normalisePagination, NormalisedPagination } from "./pagination";
import type { FacilityResults, FilterOption } from "./apiFacilityReadiness";

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

// ── Results sent ─────────────────────────────────────────────────────────

/**
 * Orders the ranking can be read in. All but one are the API's own; "last
 * result" is applied here, from the readiness report, until the ranking API
 * can sort by it itself.
 */
export type RankingOrder = FacilityRankingSortBy | "last_result";

export const LAST_RESULT_ORDER = {
  value: "last_result" as const,
  label: "Last result sent",
};

export const RANKING_ORDER_OPTIONS: { value: RankingOrder; label: string }[] = [
  ...RANKING_SORT_OPTIONS,
  LAST_RESULT_ORDER,
];

export const isClientOrder = (order: RankingOrder): order is "last_result" =>
  order === LAST_RESULT_ORDER.value;

export type RankingRowWithResults = RankingRow & {
  /** Absent when the facility has no machines installed. */
  results?: FacilityResults;
};

export const withResults = (
  rows: RankingRow[],
  results: Record<string, FacilityResults> | undefined,
): RankingRowWithResults[] =>
  rows.map((row) => ({ ...row, results: results?.[row.facility.id] }));

const resultTime = (row: RankingRowWithResults): number =>
  row.results?.lastResultAt
    ? new Date(row.results.lastResultAt.replace(" ", "T")).getTime() || 0
    : 0;

/**
 * Most recent sender first. Facilities that have never sent a result fall to
 * the bottom, still in booking order, so the busiest silent ones lead that
 * group — they are the ones worth chasing first. Ranks are reassigned to the
 * new order.
 */
export const orderByLastResult = (
  rows: RankingRowWithResults[],
): RankingRowWithResults[] =>
  [...rows]
    .sort(
      (a, b) =>
        resultTime(b) - resultTime(a) || b.bookings.total - a.bookings.total,
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
