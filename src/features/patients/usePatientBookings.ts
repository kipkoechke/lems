import { Bookings } from "@/services/apiBooking";
import { getPatientByBooking } from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";

export function usePatientBookings(patientId: string) {
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError,
    error,
    refetch,
  } = useQuery<Bookings[], Error>({
    queryKey: ["patientBookings", patientId],
    queryFn: () => getPatientByBooking(patientId),
    enabled: !!patientId,
  });

  return {
    bookings,
    bookingsLoading,
    isError,
    error,
    refetch,
  };
}
