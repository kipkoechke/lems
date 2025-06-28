import { updateService, type ServiceUpdateRequest } from "@/services/apiLots";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceUpdateRequest) => updateService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
