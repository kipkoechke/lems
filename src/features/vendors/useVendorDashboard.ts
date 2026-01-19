import { useQuery } from "@tanstack/react-query";
import {
  getVendorDashboardSummary,
  getVendorBookingTrends,
  getVendorRevenueByFacility,
  getVendorRevenueByLot,
  getVendorRevenueByService,
  VendorTrendFilters,
} from "@/services/apiVendorDashboard";
import { getContracts } from "@/services/apiVendors";

// Hook for vendor dashboard summary
export const useVendorDashboardSummary = (vendorCode: string) => {
  return useQuery({
    queryKey: ["vendorDashboardSummary", vendorCode],
    queryFn: () => getVendorDashboardSummary(vendorCode),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for vendor contracts count (for calculating stats locally)
export const useVendorStats = (vendorCode: string) => {
  const contractsQuery = useQuery({
    queryKey: ["vendorContracts", vendorCode],
    queryFn: () => getContracts({ vendor_code: vendorCode, per_page: 100 }),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000,
  });

  const contracts = contractsQuery.data?.data || [];

  // Calculate stats from contracts
  const stats = {
    total_contracts: contracts.length,
    active_contracts: contracts.filter((c) => c.is_active === "1").length,
    total_facilities_served: new Set(contracts.map((c) => c.facility?.code))
      .size,
    total_lots: new Set(contracts.map((c) => c.lot?.number)).size,
    total_services: contracts.reduce((acc, contract) => {
      const services = contract.lot?.services || contract.services || [];
      return acc + services.length;
    }, 0),
    total_equipments: contracts.reduce((acc, contract) => {
      const services = contract.lot?.services || contract.services || [];
      return acc + services.filter((s: any) => s.equipment).length;
    }, 0),
  };

  return {
    stats,
    contracts,
    isLoading: contractsQuery.isLoading,
    error: contractsQuery.error,
  };
};

// Hook for vendor booking trends with filters
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
