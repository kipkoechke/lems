import {
  updateVendor,
  VendorUpdateRequest,
} from "@/services/apiVendors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: VendorUpdateRequest;
    }) => updateVendor(vendorId, data),
    onSuccess: () => {
      toast.success("Vendor updated successfully");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error: Error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update vendor",
      );
    },
  });

  return {
    updateVendor: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
