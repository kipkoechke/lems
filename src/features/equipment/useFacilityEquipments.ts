import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createFacilityEquipment,
  getFacilityEquipment,
  getFacilityEquipments,
  FacilityEquipmentCreateRequest,
  FacilityEquipmentParams,
} from "@/services/apiFacilityEquipment";

/**
 * The caller's facility equipment — owned units plus vendor units mapped to
 * the facility. The facility comes from the auth token, so no id is passed.
 */
export const useFacilityEquipments = (params: FacilityEquipmentParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["facility-equipments", params],
    queryFn: () => getFacilityEquipments(params),
  });

  return {
    equipments: data?.data ?? [],
    summary: data?.summary,
    pagination: data?.pagination,
    availableFilters: data?.available_filters,
    isLoading,
    error,
    refetch,
  };
};

export const useFacilityEquipment = (equipmentId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["facility-equipment", equipmentId],
    queryFn: () => getFacilityEquipment(equipmentId),
    enabled: !!equipmentId,
  });

  return { equipment: data, isLoading, error, refetch };
};

/** Register a facility-owned unit by copying one already mapped to it. */
export const useCreateFacilityEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: FacilityEquipmentCreateRequest) =>
      createFacilityEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility-equipments"] });
      toast.success("Equipment added to your facility");
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(message || "Failed to add equipment");
    },
  });

  return {
    createEquipment: mutation.mutate,
    isCreating: mutation.isPending,
  };
};
