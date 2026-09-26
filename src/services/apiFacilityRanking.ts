import axios from "../lib/axios";
import { normalisePagination, NormalisedPagination } from "./pagination";
import type { FilterOption } from "./apiFacilityReadiness";

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

export interface RankingRow {
  /** Assigned over the whole filtered set, so it is stable across pages. */
  rank: number;
  facility: RankingFacility;
  bookings: RankingBookings;
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
  top_facility?: { id: string; name: string; total_bookings: number } | null;
}

export type FacilityRankingSortBy =
  | "total_bookings"
  | "patients"
  | "completed"
  | "completion_rate"
  | "cancelled"
  | "non_sha_studies";

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
    available_filters: response.data?.filters?.available,
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
];
