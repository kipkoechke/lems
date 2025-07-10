import { getVendor, getVendors } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useVendor = (vendorCode: string) => {
  const { data: vendor, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor", vendorCode],
    queryFn: async () => {
      // First try to get all vendors and find the one we need
      // This is more efficient if vendors are already cached
      const vendors = await getVendors();
      const foundVendor = vendors.find(v => v.code === vendorCode);
      if (!foundVendor) {
        throw new Error(`Vendor with code ${vendorCode} not found`);
      }
      return foundVendor;
    },
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    vendor,
    isLoading,
    error,
    refetch,
  };
};
