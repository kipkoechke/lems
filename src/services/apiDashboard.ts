import axios from "../lib/axios";
import type { EquipmentConnectivity } from "./apiConnectivity";

// ===== Dashboard Types =====

export interface EquipmentByOwner {
  vendor_owned: number;
  facility_owned: number;
}

export interface EquipmentByLinkage {
  linked: number;
  not_linked: number;
}

export interface DashboardCounts {
  total_vendors: number;
  total_equipment: number;
  equipment_by_owner: EquipmentByOwner;
  equipment_by_linkage?: EquipmentByLinkage;
  equipment_connectivity?: EquipmentConnectivity;
  /**
   * Studies that arrived with no VEMS order behind them.
   *
   * The changelog describes a bare count, but the deployed API answers with
   * the listing's summary block. Read it through `unmatchedStudyCount()`
   * rather than rendering it directly — an object lands on the page as
   * "[object Object]".
   */
  unmatched_studies?: number | UnmatchedStudiesCount;
  total_facilities: number;
  completed_studies: number;
  active_worklists: number;
}

export interface ShaClaimPaid {
  count: number;
  amount: number;
  vendor_share: number;
  facility_share: number;
}

export interface ShaClaimStatusCount {
  count: number;
}

export interface ShaClaims {
  total_claims: number;
  paid: ShaClaimPaid;
  rejected: ShaClaimStatusCount;
  pending: ShaClaimStatusCount;
  bookings_by_status: Record<string, number>;
}

export interface ModalityCategory {
  category: string;
  label: string;
  count: number;
}

export interface ModalityBreakdown {
  modality: string;
  label: string;
  count: number;
  categories: ModalityCategory[];
}

/**
 * Booking volume over time, which replaced the recent-activity block.
 *
 * Empty periods come back as `count: 0`, so the chart plots `points` as-is —
 * no gap-filling, and no need to derive buckets from dates on the client.
 */
export type TrendGranularity = "daily" | "monthly";

export interface BookingTrendPoint {
  /** Machine-readable bucket key, e.g. "2026-08-26" or "2026-08". */
  bucket: string;
  /** Pre-formatted axis label, e.g. "26 Aug". */
  label: string;
  count: number;
}

export interface BookingTrend {
  granularity: TrendGranularity;
  buckets: number;
  total: number;
  points: BookingTrendPoint[];
}

/** The summary block some deployments send in place of a bare count. */
export interface UnmatchedStudiesCount {
  total?: number;
  this_month?: number;
  unattributed?: number;
  latest_received_at?: string | null;
}

/** The headline figure, whichever shape the API sent. */
export const unmatchedStudyCount = (
  value?: number | UnmatchedStudiesCount | null,
): number => {
  if (typeof value === "number") return value;
  return value?.total ?? 0;
};

export interface DashboardFilterOption {
  value: string;
  label: string;
}

/**
 * The option lists for the dashboard filter bar, cached server-side for five
 * minutes. Driving the dropdowns from this saves a lookup request per filter.
 */
export interface DashboardAvailableFilters {
  county?: DashboardFilterOption[];
  facility?: DashboardFilterOption[];
  facility_type?: DashboardFilterOption[];
  vendor?: DashboardFilterOption[];
  period?: DashboardFilterOption[];
  trend?: DashboardFilterOption[];
}

export interface DashboardFilters {
  applied?: Record<string, string | null>;
  available?: DashboardAvailableFilters;
}

export interface DashboardParams {
  county_id?: string;
  facility_id?: string;
  facility_type?: string;
  vendor_id?: string;
  lot_id?: string;
  period?: string;
  trend?: TrendGranularity;
}

export interface DailyBreakdown {
  date: string;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface Efficiency {
  period_days: number;
  total_scheduled: number;
  total_completed: number;
  total_cancelled: number;
  completion_rate: number;
  daily_breakdown: DailyBreakdown[];
}

export interface DashboardResponse {
  counts: DashboardCounts;
  sha_claims?: ShaClaims | null;
  modalities?: ModalityBreakdown[] | null;
  booking_trend?: BookingTrend | null;
  filters?: DashboardFilters | null;
  efficiency?: Efficiency | null;
}

// ===== API Functions =====

export const getDashboard = async (
  params: DashboardParams = {},
): Promise<DashboardResponse> => {
  const response = await axios.get("/admin/dashboard", { params });
  // Handle both wrapped and unwrapped responses
  const body = response.data as { data?: DashboardResponse } & DashboardResponse;
  return (body.data ?? response.data) as DashboardResponse;
};
