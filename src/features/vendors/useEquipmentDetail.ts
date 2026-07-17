import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEquipment, getEquipmentDetail } from "@/services/apiEquipment";

/**
 * Equipment detail for the admin-facing page, read from the shared
 * /equipment/{id} route. The vendor-portal hooks read /vendor/equipments/{id},
 * which 403s for every non-vendor role.
 */
export const useEquipmentDetail = (equipmentId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["equipment-detail", equipmentId],
    queryFn: () => getEquipmentDetail(equipmentId),
    enabled: !!equipmentId,
  });

  return { equipment: data, isLoading, error, refetch };
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (equipmentId: string) => deleteEquipment(equipmentId),
    onSuccess: () => {
      toast.success("Equipment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-equipments"] });
    },
    onError: (error: Error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete equipment",
      );
    },
  });

  return {
    deleteEquipment: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};
