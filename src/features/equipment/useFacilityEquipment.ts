import { useQuery } from "@tanstack/react-query";
import { getFacilityOperationalEquipment } from "@/services/apiEquipment";

/**
 * Operational equipment at the signed-in user's facility.
 *
 * Facility roles must read `/equipment/facility/{facility}/operational` — the
 * admin listing (`/admin/equipment`) is restricted to admin/nesp/moh/cog and
 * 403s for them.
 */
export const useFacilityEquipment = (facilityId?: string | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["facility-operational-equipment", facilityId],
    queryFn: () => getFacilityOperationalEquipment(facilityId as string),
    enabled: !!facilityId,
  });

  return {
    equipments: data ?? [],
    isLoading: !!facilityId && isLoading,
    error,
    refetch,
  };
};
