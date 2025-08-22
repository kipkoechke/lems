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

  return {
    isLoading,
    bookings: data?.bookings.data || [],
    pagination: data?.bookings,
    error,
    refetchBookings,
  };
}
