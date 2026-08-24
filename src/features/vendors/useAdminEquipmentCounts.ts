import { useQuery } from "@tanstack/react-query";
import {
  getAdminEquipmentModalityCounts,
  AdminEquipmentParams,
} from "@/services/apiEquipment";

type CountParams = Pick<
  AdminEquipmentParams,
  "status" | "vendor_id" | "search"
>;

/**
 * Modality breakdown for the equipment summary cards. Tallied by paging the
 * listing, so it is cached longer than the table itself.
 */
export const useAdminEquipmentCounts = (params: CountParams = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-equipment-modality-counts", params],
    queryFn: () => getAdminEquipmentModalityCounts(params),
    staleTime: 1000 * 60 * 5,
  });

  return {
    counts: data?.counts ?? [],
    total: data?.total ?? 0,
    truncated: data?.truncated ?? false,
    isLoading,
    error,
  };
};
