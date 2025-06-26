import { Bookings } from "@/services/apiBooking";
import { getPatientByBooking } from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";

export function usePatientBookings(id: string) {
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError,
    error,
    refetch,
  } = useQuery<Bookings[], Error>({
    queryKey: ["patientBookings", id],
    queryFn: () => getPatientByBooking(id),
    enabled: !!id,
  });

  return {
    bookings,
    bookingsLoading,
    isError,
    error,
    refetch,
  };
}
