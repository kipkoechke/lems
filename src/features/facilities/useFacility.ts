import { getFacilityByCode } from "@/services/apiFacility";
import { useQuery } from "@tanstack/react-query";

export const useFacility = (facilityCode: string) => {
  const { data: facility, isLoading, error, refetch } = useQuery({
    queryKey: ["facility", facilityCode],
    queryFn: () => getFacilityByCode(facilityCode),
    enabled: !!facilityCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    facility,
    isLoading,
    error,
    refetch,
  };
};
