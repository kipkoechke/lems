import { useQuery } from "@tanstack/react-query";
import {
  getAdminEquipments,
  AdminEquipmentParams,
} from "@/services/apiEquipment";

export const useAdminEquipments = (params: AdminEquipmentParams = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-equipments", params],
    queryFn: () => getAdminEquipments(params),
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
