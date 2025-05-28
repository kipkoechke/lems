import {
  getServiceByCategory,
  ServiceWithCategory,
} from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export const useServiceByCategory = (categoryId: string) => {
  const {
    isPending: isServiceByCategoryLoading,
    data: services,
    error,
  } = useQuery<ServiceWithCategory[]>({
    queryKey: ["servicesByCategory", categoryId],
    queryFn: () => getServiceByCategory(categoryId),
    enabled: !!categoryId,
  });

  return {
    isServiceByCategoryLoading,
    services,
    error,
  };
};
