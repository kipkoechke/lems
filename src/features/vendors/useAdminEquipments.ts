import { useQuery } from "@tanstack/react-query";
import {
  getAdminEquipments,
  AdminEquipmentParams,
} from "@/services/apiEquipment";

export const useAdminEquipments = (
  params: AdminEquipmentParams = {},
  options: { enabled?: boolean } = {},
) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-equipments", params],
    queryFn: () => getAdminEquipments(params),
    // Callers scoping by vendor must wait for the id, or the first request
    // returns every vendor's equipment.
    enabled: options.enabled ?? true,
  });

  return {
    equipments: data?.data || [],
    pagination: data?.pagination,
    availableFilters: data?.available_filters,
    isLoading,
    error,
    refetch,
  };
};
