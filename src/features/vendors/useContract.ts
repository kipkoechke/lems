import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useContract = (contractId: string) => {
  const {
    data: contractsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => getContracts(),
    enabled: !!contractId,
  });

  const contracts = contractsData?.data || [];
  const contract = contracts.find((c) => c.id === contractId);

  return {
    contract,
    isLoading,
    error,
    refetch,
  };
};
