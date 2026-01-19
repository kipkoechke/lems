import { getLotServices, Service, PaginationMeta } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

export const useLotServices = (lotId: string, page: number = 1) => {
  const query = useQuery({
    queryKey: ["lot-services", lotId, page],
    queryFn: () => getLotServices(lotId, page),
    enabled: !!lotId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    services: (query.data?.data || []) as Service[],
    pagination: query.data?.pagination as PaginationMeta | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
