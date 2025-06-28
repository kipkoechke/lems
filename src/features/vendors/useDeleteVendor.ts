import { deleteVendor } from "@/services/apiVendors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      toast.success("Vendor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete vendor");
    },
  });

  return {
    deleteVendor: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};
