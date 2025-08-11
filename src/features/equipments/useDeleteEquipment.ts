import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteEquipment } from "@/services/apiEquipment";

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: () => {
      toast.success("Equipment deleted");
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete equipment"
      );
    },
  });

  return {
    deleteEquipment: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};
