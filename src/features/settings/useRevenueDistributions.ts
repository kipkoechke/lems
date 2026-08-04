import { useQuery } from "@tanstack/react-query";
import {
  getRevenueDistributions,
  RevenueDistributionParams,
} from "@/services/apiRevenueDistributions";

export const useRevenueDistributions = (params: RevenueDistributionParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["revenue-distributions", params],
    queryFn: () => getRevenueDistributions(params),
  });

  return {
    distributions: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};
