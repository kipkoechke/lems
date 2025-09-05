import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBatch, CreateBatchRequest } from "@/services/apiSyncBooking";
import toast from "react-hot-toast";

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateBatchRequest) => createBatch(data),
    onSuccess: () => {
      toast.success("Batch created successfully!");
      // Invalidate and refetch all related queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["syncedBookings"] });
      queryClient.invalidateQueries({ queryKey: ["vendorBatches"] });
      queryClient.invalidateQueries({ queryKey: ["facilityPayments"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create batch";
      toast.error(errorMessage);
    },
  });

  return {
    createBatch: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
