import { getContractServices } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useContractServices = (contractId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contractServices", contractId],
    queryFn: () => getContractServices(contractId),
    enabled: !!contractId,
  });

  return {
    contractInfo: data?.contract,
    totalServices: data?.total_services || 0,
    lotsWithServices: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};
