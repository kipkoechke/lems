import { getVendor } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useVendor = (vendorId: string) => {
  const {
    data: vendor,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendor(vendorId),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    vendor,
    isLoading,
    error,
    refetch,
  };
};
