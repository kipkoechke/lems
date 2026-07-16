import { getVendors, VendorListParams } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useVendors = (params: VendorListParams = {}) => {
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors", params],
    queryFn: () => getVendors(params),
  });

  return {
    vendors,
    isLoading,
    error,
    refetch,
  };
};
