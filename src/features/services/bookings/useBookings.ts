import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
    // Keep the current rows on screen while a changed filter loads, so picking
    // a facility doesn't drop the page back to a full-screen skeleton.
    placeholderData: keepPreviousData,
  });
}
