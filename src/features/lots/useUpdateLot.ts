import { LotUpdateRequest, updateLot } from "@/services/apiLots";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateLot = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: LotUpdateRequest) => updateLot(data),
    onSuccess: () => {
      toast.success("Lot updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update lot");
    },
  });

  return {
    updateLot: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
