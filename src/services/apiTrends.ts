import axios from "../lib/axios";

// ============================================================
// Analytics-based Trends
// Uses the analytics endpoints from the API reference
// ============================================================

export interface BookingTrendData {
  date: string;
  payment_mode: string;
  total: string;
  total_amount: string;
  total_vendor_share: string;
  total_facility_share: string;
}

export interface BookingTrendsResponse {
  trends: BookingTrendData[];
}

export interface TrendFilters {
  start_time?: string;
  end_time?: string;
  procedure_type?: string;
  vendor?: string;
  facility?: string;
  equipment?: string;
  modality?: string;
  procedure?: string;
}

// GET /analytics/reports/procedure-costs — used for trend data
export const getBookingTrends = async (
  filters: TrendFilters = {},
): Promise<BookingTrendsResponse> => {
  const response = await axios.get("/analytics/reports/procedure-costs", {
    params: filters,
  });
  return response.data;
};
