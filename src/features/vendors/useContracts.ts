import { ContractFilterParams, getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useContracts = (params?: ContractFilterParams) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["contracts", params],
    queryFn: () => getContracts(params),
  });

  return {
    contracts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};
