import { getServicesByFacilityId } from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";
import type {
  FacilityContract,
  FlattenedContractService,
  flattenContractServices,
} from "@/types/contract";
import { useMemo } from "react";

export const useServicesByFacilityId = (facilityId: string) => {
  const {
    isPending: isServicesLoading,
    data: contracts,
    error,
  } = useQuery<FacilityContract[]>({
    queryKey: ["servicesByFacilityId", facilityId],
    queryFn: () => getServicesByFacilityId(facilityId),
    enabled: !!facilityId,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Provide flattened services for components that need the old structure
  const flattenedServices = useMemo((): FlattenedContractService[] => {
    if (!contracts) return [];
    return contracts.flatMap((contract) => {
      // Inline flatten logic to avoid circular import
      return contract.services.map((svc) => ({
        id: svc.id,
        is_active: svc.is_active,
        service_id: svc.service.id,
        service_code: svc.service.code,
        service_name: svc.service.name,
        sha_rate: svc.service.tariff,
        lot_id: svc.lot.id,
        lot_number: svc.lot.number,
        lot_name: svc.lot.name,
        equipment: svc.equipment,
        contract_id: contract.id,
        vendor_name: contract.vendor.name,
        facility_name: contract.facility.name,
      }));
    });
  }, [contracts]);

  return {
    isServicesLoading,
    contracts: contracts || [],
    flattenedServices,
    error,
  };
};

// Backward compatibility alias
export const useServicesByFacilityCode = useServicesByFacilityId;
