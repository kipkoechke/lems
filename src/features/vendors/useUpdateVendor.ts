import { updateVendor, VendorUpdateRequest } from "@/services/apiVendors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: VendorUpdateRequest) => updateVendor(data),
    onSuccess: () => {
      toast.success("Vendor updated successfully");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update vendor");
    },
  });

  return {
    updateVendor: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
