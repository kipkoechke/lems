import {
  getLotById,
  getLotServices,
  LotDetail,
  Service,
  PaginationMeta,
} from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

export const useLotWithServices = (id: string, servicesPage: number = 1) => {
  const lotQuery = useQuery({
    queryKey: ["lot", id],
    queryFn: () => getLotById(id),
    enabled: !!id,
  });

  const servicesQuery = useQuery({
    queryKey: ["lot-services", id, servicesPage],
    queryFn: () => getLotServices(id, servicesPage),
    enabled: !!id,
  });

  return {
    lot: lotQuery.data as LotDetail | undefined,
    services: (servicesQuery.data?.data || []) as Service[],
    servicesPagination: servicesQuery.data?.pagination as
      | PaginationMeta
      | undefined,
    isLoading: lotQuery.isLoading || servicesQuery.isLoading,
    error: lotQuery.error || servicesQuery.error,
    refetch: () => {
      lotQuery.refetch();
      servicesQuery.refetch();
    },
    refetchServices: servicesQuery.refetch,
  };
};
