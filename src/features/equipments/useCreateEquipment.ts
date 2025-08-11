import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createEquipment,
  EquipmentCreateRequest,
} from "@/services/apiEquipment";

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: EquipmentCreateRequest) => createEquipment(data),
    onSuccess: () => {
      toast.success("Equipment created");
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create equipment"
      );
    },
  });

  return {
    createEquipment: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
