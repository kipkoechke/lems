import { useQuery } from "@tanstack/react-query";
import {
  getVendorDashboard,
  getVendorBookingTrends,
  getVendorRevenueByFacility,
  getVendorRevenueByLot,
  getVendorRevenueByService,
  VendorDashboardFilters,
  VendorTrendFilters,
} from "@/services/apiVendorDashboard";

// NEW: Hook for vendor dashboard using the new /vendors/{id}/dashboard endpoint
export const useVendorDashboard = (
  vendorId: string,
  filters?: VendorDashboardFilters
) => {
  return useQuery({
    queryKey: ["vendorDashboard", vendorId, filters],
    queryFn: () => getVendorDashboard(vendorId, filters),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Legacy hook for vendor booking trends with filters (kept for backward compatibility)
export const useVendorBookingTrends = (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>
) => {
  return useQuery({
    queryKey: ["vendorBookingTrends", vendorCode, filters],
    queryFn: () => getVendorBookingTrends(vendorCode, filters),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for revenue by facility
export const useVendorRevenueByFacility = (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>
) => {
  return useQuery({
    queryKey: ["vendorRevenueByFacility", vendorCode, filters],
    queryFn: () => getVendorRevenueByFacility(vendorCode, filters),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for revenue by lot
export const useVendorRevenueByLot = (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>
) => {
  return useQuery({
    queryKey: ["vendorRevenueByLot", vendorCode, filters],
    queryFn: () => getVendorRevenueByLot(vendorCode, filters),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for revenue by service
export const useVendorRevenueByService = (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>
) => {
  return useQuery({
    queryKey: ["vendorRevenueByService", vendorCode, filters],
    queryFn: () => getVendorRevenueByService(vendorCode, filters),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000,
  });
};
