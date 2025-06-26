import {
  getServiceByCategory,
  ServiceWithCategory,
} from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export const useServiceByCategory = (id: string) => {
  const {
    isPending: isServiceByCategoryLoading,
    data: services,
    error,
  } = useQuery<ServiceWithCategory[]>({
    queryKey: ["servicesByCategory", id],
    queryFn: () => getServiceByCategory(id),
    enabled: !!id,
  });

  return {
    isServiceByCategoryLoading,
    services,
    error,
  };
};
