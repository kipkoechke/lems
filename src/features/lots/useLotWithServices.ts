import { getLotWithServices } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

export const useLotWithServices = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lot-with-services", id],
    queryFn: () => getLotWithServices(id),
    enabled: !!id,
  });

  return {
    lot: data ? { id: data.id, number: data.number, name: data.name, is_active: data.is_active } : undefined,
    services: data?.services || [],
    isLoading,
    error,
    refetch,
  };
};
