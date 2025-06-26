import { getServicesByFacilityCode } from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export const useServicesByFacilityCode = (facilityCode: string) => {
  const {
    isPending: isServicesLoading,
    data: contracts,
    error,
  } = useQuery({
    queryKey: ["servicesByFacilityCode", facilityCode],
    queryFn: () => getServicesByFacilityCode(facilityCode),
    enabled: !!facilityCode, // Only run query if facilityCode exists
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("useServicesByFacilityCode:", {
    facilityCode,
    isServicesLoading,
    contracts,
    error,
    enabled: !!facilityCode,
  });

  return {
    isServicesLoading,
    contracts: contracts || [],
    error,
  };
};
