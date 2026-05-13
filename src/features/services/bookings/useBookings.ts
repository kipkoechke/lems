import { useQuery } from "@tanstack/react-query";
import {
  BookingFilters,
  getBookings,
  getBookingsWithPagination,
} from "@/services/apiBooking";

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
  return useQuery({
    queryKey: ["bookings-paginated", filters],
    queryFn: () => getBookingsWithPagination(filters),
  });
}
