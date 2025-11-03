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

  // Handle both old and new response formats
  const bookingsData = data?.bookings?.data || data?.data || [];
  const paginationData = data?.bookings || data?.pagination;

  return {
    isLoading,
    bookings: bookingsData,
    pagination: paginationData,
    error,
    refetchBookings,
  };
}
