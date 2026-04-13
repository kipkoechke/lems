import axios from "../lib/axios";
import { BookingFilters } from "./apiBooking";

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

export const getBookingTrends = async (
  filters: BookingFilters = {},
): Promise<BookingTrendsResponse> => {
  const response = await axios.get("bookings/trends", {
    params: filters,
  });
  return response.data;
};
