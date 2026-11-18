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
    // Hold the previous page while a filter change is in flight. Without it
    // `isLoading` goes true on every change and the list page swaps itself for
    // a full-page skeleton — which unmounts the filter controls, so an open
    // multi-select closes after the first choice and a second one cannot be
    // made at all.
    placeholderData: (previous) => previous,
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
