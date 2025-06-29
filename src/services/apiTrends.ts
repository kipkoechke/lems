import axios from "../lib/axios";
import { BookingFilters } from "./apiBooking";

export interface BookingsTrendItem {
  date: string; // e.g. "2025-06-01"
  count: number;
  total_amount: number;
}

export interface PaymentModeDistributionItem {
  payment_mode_id: string;
  count: number;
  total_amount: number;
  name: string;
}

// New interface for the booking trends API
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

export const getBookingsTrend = async (
  filters: BookingFilters = {}
): Promise<BookingsTrendItem[]> => {
  const response = await axios.get("graphs/booking_trends", {
    params: filters,
  });
  // Transform trend_data object to array
  const trendObj = response.data.trend_data || {};
  return Object.values(trendObj) as BookingsTrendItem[];
};

export const getPaymentModeDistribution = async (
  filters: BookingFilters = {}
): Promise<PaymentModeDistributionItem[]> => {
  const response = await axios.get("/graphs/payment_mode_distribution", {
    params: filters,
  });
  return response.data.payment_mode_data;
};

// New function for the booking trends endpoint
export const getBookingTrends = async (
  filters: BookingFilters = {}
): Promise<BookingTrendsResponse> => {
  const response = await axios.get("bookings/trends", {
    params: filters,
  });
  return response.data;
};
