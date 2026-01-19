import { LotUpdateRequest, updateLot } from "@/services/apiLots";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UpdateLotParams {
  id: string;
  data: LotUpdateRequest;
}

export const useUpdateLot = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateLotParams) => updateLot(id, data),
    onSuccess: (_, variables) => {
      toast.success("Lot updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lots"] });
      queryClient.invalidateQueries({ queryKey: ["lot", variables.id] });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(error?.response?.data?.message || "Failed to update lot");
    },
  });

  return {
    updateLot: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
