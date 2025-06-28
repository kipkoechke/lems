import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useContract = (contractId: string) => {
  const {
    data: contracts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => getContracts(),
    enabled: !!contractId,
  });

  const contract = contracts.find((c) => c.id === contractId);

  return {
    contract,
    isLoading,
    error,
    refetch,
  };
};
