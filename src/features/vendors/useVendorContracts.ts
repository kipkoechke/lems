import { useQuery } from "@tanstack/react-query";
import {
  getVendorContracts,
  VendorContractsParams,
} from "@/services/apiVendorContracts";

export const useVendorContracts = (params: VendorContractsParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-contracts", params],
    queryFn: () => getVendorContracts(params),
  });

  return {
    contracts: data?.contracts ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};
