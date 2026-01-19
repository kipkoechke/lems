import { updateService, type ServiceUpdateRequest } from "@/services/apiLots";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UpdateServiceParams {
  serviceId: string;
  data: ServiceUpdateRequest;
}

export const useUpdateService = (lotId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, data }: UpdateServiceParams) => 
      updateService(lotId, serviceId, data),
    onSuccess: () => {
      toast.success("Service updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lot-services", lotId] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || "Failed to update service");
    },
  });
};
