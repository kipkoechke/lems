import { getServiceBookingById } from "@/services/apiBooking";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useBooking() {
  const { bookingId } = useParams();

  const {
    isLoading,
    data: booking,
    error,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getServiceBookingById(bookingId as string),
    retry: false,
  });

  return { isLoading, booking, error };
}
