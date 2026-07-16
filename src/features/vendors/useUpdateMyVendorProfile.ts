import { updateMyVendorProfile, VendorUpdateRequest } from "@/services/apiVendors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

/**
 * Updates the signed-in vendor's own record via the token-scoped route, rather
 * than the admin /vendors/{id} endpoint vendors cannot call.
 */
export const useUpdateMyVendorProfile = (vendorId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: VendorUpdateRequest) =>
      updateMyVendorProfile(data, vendorId),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["my-vendor"] });
    },
    onError: (error: Error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update profile",
      );
    },
  });

  return {
    updateProfile: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
