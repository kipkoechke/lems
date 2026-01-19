import { deleteLot } from "@/services/apiLots";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteLot = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (lotId: string) => deleteLot(lotId),
    onSuccess: () => {
      toast.success("Lot deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || "Failed to delete lot");
    },
  });

  return {
    deleteLot: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};
