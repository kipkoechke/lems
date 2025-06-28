import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteService } from "@/services/apiLots";

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceCode: string) => deleteService(serviceCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
