import { getLotWithServices } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

export const useLotWithServices = (lotNumber: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lot-with-services", lotNumber],
    queryFn: () => getLotWithServices(lotNumber),
    enabled: !!lotNumber,
  });

  return {
    lot: data?.lot,
    services: data?.services || [],
    isLoading,
    error,
    refetch,
  };
};
