import { getBookings } from "@/services/apiBooking";
import { useQuery } from "@tanstack/react-query";

export function useBookingss() {
  const {
    isPending: isLoading,
    data: bookings,
    error,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  return { isLoading, bookings, error };
}
