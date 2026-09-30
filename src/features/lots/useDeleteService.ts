import { deleteService } from "@/services/apiLots";
import { apiErrorMessage } from "@/lib/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteService = (lotId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(lotId, serviceId),
    onSuccess: () => {
      toast.success("Service deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lot-services", lotId] });
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(apiErrorMessage(error, "Failed to delete service"));
    },
  });
};
