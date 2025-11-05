import { getContract } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useContract = (contractId: string) => {
  const {
    data: contract,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => getContract(contractId),
    enabled: !!contractId,
  });

  return {
    contract,
    isLoading,
    error,
    refetch,
  };
};
