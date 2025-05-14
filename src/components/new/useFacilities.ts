import { useQuery } from "@tanstack/react-query";
import { getFacilities } from "@/services/apiFacility";

export function useFacilities() {
  const {
    isLoading,
    data: facilities,
    error,
  } = useQuery({
    queryKey: ["facilities"],
    queryFn: getFacilities,
  });

  return { isLoading, facilities, error };
}
