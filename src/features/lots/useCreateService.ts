import { createService, type ServiceCreateRequest } from "@/services/apiLots";
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
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || "Failed to create service");
    },
  });
};
