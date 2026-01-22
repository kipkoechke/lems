import {
  BookingFilters,
  getBookings,
  getBookingsWithPagination,
} from "@/services/apiBooking";
import { useQuery } from "@tanstack/react-query";

export function useBookings(filters: BookingFilters = {}) {
  const {
    isPending: isLoading,
    data: bookings = [],
    error,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => getBookings(filters),
  });

  return { isLoading, bookings, error, refetchBookings };
}

export function useBookingsWithPagination(filters: BookingFilters = {}) {
  const {
    isPending: isLoading,
    data,
    error,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings-paginated", filters],
    queryFn: () => getBookingsWithPagination(filters),
  });

  // Handle response format - data.data contains bookings array
  const bookingsData = data?.data || [];
  const paginationData = data?.pagination;
  const summaryData = data?.summary;

  return {
    isLoading,
    bookings: bookingsData,
    pagination: paginationData,
    summary: summaryData,
    error,
    refetchBookings,
  };
}
