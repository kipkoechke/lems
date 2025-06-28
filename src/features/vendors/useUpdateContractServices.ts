import {
  ContractUpdateRequest,
  updateContractServices,
} from "@/services/apiVendors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateContractServices = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ContractUpdateRequest) => updateContractServices(data),
    onSuccess: () => {
      toast.success("Contract services updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update contract services"
      );
    },
  });

  return {
    updateContractServices: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
