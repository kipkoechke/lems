import {
  BookingTrendsResponse,
  getBookingTrends,
  TrendFilters,
} from "@/services/apiTrends";
import { useQuery } from "@tanstack/react-query";

export const useBookingTrends = (filters: TrendFilters = {}) => {
  const {
    data: trendsData,
    isLoading,
    error,
    refetch,
  } = useQuery<BookingTrendsResponse>({
    queryKey: ["booking-trends", filters],
    queryFn: () => getBookingTrends(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    trendsData,
    trends: trendsData?.trends || [],
    isLoading,
    error,
    refetch,
  };
};
