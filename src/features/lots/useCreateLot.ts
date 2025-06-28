import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createLot, LotCreateRequest } from "@/services/apiLots";

export const useCreateLot = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: LotCreateRequest) => createLot(data),
    onSuccess: () => {
      toast.success("Lot created successfully");
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create lot");
    },
  });

  return {
    createLot: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
