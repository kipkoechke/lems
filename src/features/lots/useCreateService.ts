import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService, type ServiceCreateRequest } from "@/services/apiLots";

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceCreateRequest) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
