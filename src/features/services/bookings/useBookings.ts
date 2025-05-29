import { getBookings } from "@/services/apiBooking";
import { useQuery } from "@tanstack/react-query";

export function useBookings() {
  const {
    isPending: isLoading,
    data: bookings = [],
    error,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  return { isLoading, bookings, error, refetchBookings };
}
