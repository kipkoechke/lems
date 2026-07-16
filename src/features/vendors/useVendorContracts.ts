import { useQuery } from "@tanstack/react-query";
import {
  getVendorContract,
  getVendorContractServices,
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
    summary: data?.summary,
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useVendorContract = (contractId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-contract", contractId],
    queryFn: () => getVendorContract(contractId),
    enabled: !!contractId,
  });

  return { contract: data, isLoading, error, refetch };
};

export const useVendorContractServices = (contractId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-contract-services", contractId],
    queryFn: () => getVendorContractServices(contractId),
    enabled: !!contractId,
  });

  return { services: data ?? [], isLoading, error, refetch };
};
