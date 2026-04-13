import {
  getVendorDashboard,
  VendorDashboardFilters,
} from "@/services/apiVendorDashboard";
import { useQuery } from "@tanstack/react-query";

// NEW: Hook for vendor dashboard using the new /vendors/{id}/dashboard endpoint
export const useVendorDashboard = (
  vendorId: string,
  filters?: VendorDashboardFilters,
) => {
  return useQuery({
    queryKey: ["vendorDashboard", vendorId, filters],
    queryFn: () => getVendorDashboard(vendorId, filters),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
