import { ContractCreateRequest, createContract } from "@/services/apiVendors";
import { apiErrorMessage } from "@/lib/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useCreateContract = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ContractCreateRequest) => createContract(data),
    onSuccess: () => {
      toast.success("Contract created successfully");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: (error: any) => {
      toast.error(
        apiErrorMessage(error, "Failed to create contract")
      );
    },
  });

  return {
    createContract: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
