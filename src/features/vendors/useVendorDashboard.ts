import {
  getVendorDashboard,
  VendorDashboardFilters,
} from "@/services/apiVendorDashboard";
import { useQuery } from "@tanstack/react-query";

// Reads /vendor/dashboard, which infers the vendor from the auth token. The id
// is a cache key only and must not gate the request.
export const useVendorDashboard = (
  vendorId: string,
  filters?: VendorDashboardFilters,
) => {
  return useQuery({
    queryKey: ["vendorDashboard", vendorId, filters],
    queryFn: () => getVendorDashboard(vendorId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
