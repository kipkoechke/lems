import {
  getServiceByCategory,
  ServiceWithCategory,
} from "@/services/apiServiceInfo";
import { useQuery } from "@tanstack/react-query";

export const useServiceByCategory = (categoryId: string) => {
  const {
    isPending,
    data: services,
    error,
  } = useQuery<ServiceWithCategory[]>({
    queryKey: ["servicesByCategory", categoryId],
    queryFn: () => getServiceByCategory(categoryId),
    enabled: !!categoryId,
  });

  return {
    isPending,
    data: services,
    error,
  };
};
