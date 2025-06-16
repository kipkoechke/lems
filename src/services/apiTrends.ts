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
