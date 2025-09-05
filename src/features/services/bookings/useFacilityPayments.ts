import { useQuery } from "@tanstack/react-query";
import {
  fetchFacilityPayments,
  FacilityPaymentsResponse,
} from "@/services/apiSyncBooking";

export function useFacilityPayments(page: number = 1) {
  return useQuery<FacilityPaymentsResponse, Error>({
    queryKey: ["facilityPayments", page],
    queryFn: () => fetchFacilityPayments(page),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
