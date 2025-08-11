import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  updateEquipment,
  EquipmentUpdateRequest,
} from "@/services/apiEquipment";

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: EquipmentUpdateRequest) => updateEquipment(data),
    onSuccess: () => {
      toast.success("Equipment updated");
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update equipment"
      );
    },
  });

  return {
    updateEquipment: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
