import { createVendor, VendorCreateRequest } from "@/services/apiVendors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: VendorCreateRequest) => createVendor(data),
    onSuccess: () => {
      toast.success("Vendor created successfully");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create vendor");
    },
  });

  return {
    createVendor: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
