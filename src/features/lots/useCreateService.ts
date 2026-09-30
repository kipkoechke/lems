import { createService, type ServiceCreateRequest } from "@/services/apiLots";
import { apiErrorMessage } from "@/lib/apiError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useCreateService = (lotId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceCreateRequest) => createService(lotId, data),
    onSuccess: () => {
      toast.success("Service created successfully");
      queryClient.invalidateQueries({ queryKey: ["lot-services", lotId] });
      queryClient.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      toast.error(apiErrorMessage(error, "Failed to create service"));
    },
  });
};
