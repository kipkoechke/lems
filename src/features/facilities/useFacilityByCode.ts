import { useQuery } from "@tanstack/react-query";
import { getFacilities, Facility } from "@/services/apiFacility";

interface UseFacilityByCodeParams {
  facilityCode?: string;
  enabled?: boolean;
}

export const useFacilityByCode = ({
  facilityCode,
  enabled = true,
}: UseFacilityByCodeParams) => {
  return useQuery<Facility | null>({
    queryKey: ["facility", facilityCode],
    queryFn: async () => {
      if (!facilityCode) return null;
      
      const facilities = await getFacilities({ 
        code: facilityCode,
        per_page: 1 
      });
      
      return facilities.length > 0 ? facilities[0] : null;
    },
    enabled: enabled && !!facilityCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
