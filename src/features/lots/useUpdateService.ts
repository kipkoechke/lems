import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateService, type ServiceUpdateRequest } from "@/services/apiLots";

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceUpdateRequest) => updateService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
