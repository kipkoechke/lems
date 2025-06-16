import { BookingFilters } from "@/services/apiBooking";
import {
  BookingsTrendItem,
  getBookingsTrend,
  getPaymentModeDistribution,
  PaymentModeDistributionItem,
} from "@/services/apiTrends";
import { useQuery } from "@tanstack/react-query";

export function useBookingsTrend(filters: BookingFilters = {}) {
  return useQuery<BookingsTrendItem[]>({
    queryKey: ["bookingsTrend", filters],
    queryFn: () => getBookingsTrend(filters),
  });
}

export function usePaymentModeDistribution(filters: BookingFilters = {}) {
  return useQuery<PaymentModeDistributionItem[]>({
    queryKey: ["paymentModeDistribution", filters],
    queryFn: () => getPaymentModeDistribution(filters),
  });
}
