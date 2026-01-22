import { getServicesByFacilityId } from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export const useServicesByFacilityId = (facilityId: string) => {
  const {
    isPending: isServicesLoading,
    data: contracts,
    error,
  } = useQuery({
    queryKey: ["servicesByFacilityId", facilityId],
    queryFn: () => getServicesByFacilityId(facilityId),
    enabled: !!facilityId, // Only run query if facilityId exists
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("useServicesByFacilityId:", {
    facilityId,
    isServicesLoading,
    contracts,
    error,
    enabled: !!facilityId,
  });

  return {
    isServicesLoading,
    contracts: contracts || [],
    error,
  };
};

// Backward compatibility alias
export const useServicesByFacilityCode = useServicesByFacilityId;
