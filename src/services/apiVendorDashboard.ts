import axios from "../lib/axios";
import type { EquipmentConnectivity } from "./apiConnectivity";
import type {
  BookingTrend,
  DashboardFilterOption,
  UnmatchedStudiesCount,
} from "./apiDashboard";

// =============================================
// Vendor Dashboard API Types — matched to live API response
// =============================================

export interface VendorDashboardVendorInfo {
  id: string;
  name: string;
  code: string;
  email?: string | null;
}

export interface VendorDashboardEquipmentLinkage {
  linked: number;
  not_linked: number;
}

export interface VendorDashboardEquipmentStats {
  total: number;
  by_status: Record<string, number>;
  by_linkage?: VendorDashboardEquipmentLinkage;
  /** The shared connectivity card — live, linked and never-connected. */
  by_connectivity?: EquipmentConnectivity;
}

export interface VendorDashboardBookingStats {
  total_bookings: number;
  total_services: number;
  by_service_status?: Record<string, number>;
  by_source?: Record<string, number>;
}

export interface VendorDashboardRevenueStats {
  total_tariff: number;
  vendor_share: number;
  facility_share?: number;
  by_payment_type: Record<string, number>;
}

export interface VendorDashboardFacilityServed {
  id: string;
  name: string;
  fr_code: string;
}

export interface VendorDashboardLotCovered {
  number: string;
  name: string;
}

export interface VendorDashboardTrendlineDataPoint {
  period: string;
  sha?: string;
  cash?: string;
  other_insurance?: string;
  vendor_share?: string;
  total?: string;
  services_count?: number;
}

export interface VendorDashboardTrendlineStats {
  grouping: string;
  data: VendorDashboardTrendlineDataPoint[];
}

export interface VendorDashboardResponse {
  vendor: VendorDashboardVendorInfo;
  equipment: VendorDashboardEquipmentStats;
  bookings: VendorDashboardBookingStats;
  revenue: VendorDashboardRevenueStats;
  facilities_served?: VendorDashboardFacilityServed[];
  lots_covered?: VendorDashboardLotCovered[];
  patients?: { unique_count: number };
  services?: { count: number; list: { id: string; code: string; name: string }[] };
  trendline?: VendorDashboardTrendlineStats;
  /**
   * Studies that arrived on this vendor's machines with no VEMS order.
   * May be a bare count or the listing's summary block — read it through
   * `unmatchedStudyCount()`.
   */
  unmatched_studies?: number | UnmatchedStudiesCount;
  /**
   * Bookings on this vendor's machines, wherever they stand. Same shape as the
   * admin and facility dashboards.
   */
  booking_trend?: BookingTrend | null;
  trend_options?: DashboardFilterOption[];
}

// Filter params for vendor dashboard
export interface VendorDashboardFilters {
  from?: string;
  to?: string;
  trend?: "daily" | "monthly";
  facility_id?: string;
  lot_id?: string;
  service_id?: string;
  grouping?: "day" | "week" | "month";
}

// GET /vendor/dashboard — vendor inferred from auth token
export const getVendorDashboard = async (
  _vendorId: string,
  filters?: VendorDashboardFilters,
): Promise<VendorDashboardResponse> => {
  const params: Record<string, string> = {};

  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  if (filters?.facility_id) params.facility_id = filters.facility_id;
  if (filters?.lot_id) params.lot_id = filters.lot_id;
  if (filters?.service_id) params.service_id = filters.service_id;
  if (filters?.grouping) params.grouping = filters.grouping;

  const response = await axios.get(`/vendor/dashboard`, {
    params,
  });
  return response.data.data ?? response.data;
};

// =============================================
// Analytics – Vendor
// =============================================

export interface VendorAnalyticsFilters {
  start_time?: string;
  end_time?: string;
  procedure_type?: string;
}

export interface VendorByEquipments {
  vendor_id: string;
  vendor_name: string;
  total_equipment: number;
}

export interface VendorByFacilities {
  vendor_id: string;
  vendor_name: string;
  total_facilities: number;
}

export interface VendorByProcedures {
  vendor_id: string;
  vendor_name: string;
  total_procedures: number;
}

export interface VendorByProcedureType {
  vendor_id: string;
  vendor_name: string;
  procedure_type: string;
  total: number;
}

// GET /analytics/vendors/by-equipments
export const getVendorAnalyticsByEquipments = async (
  filters?: VendorAnalyticsFilters,
): Promise<VendorByEquipments[]> => {
  const response = await axios.get("/analytics/vendors/by-equipments", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/vendors/by-facilities-supporting
export const getVendorAnalyticsByFacilities = async (
  filters?: VendorAnalyticsFilters,
): Promise<VendorByFacilities[]> => {
  const response = await axios.get("/analytics/vendors/by-facilities-supporting", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/vendors/by-procedures
export const getVendorAnalyticsByProcedures = async (
  filters?: VendorAnalyticsFilters,
): Promise<VendorByProcedures[]> => {
  const response = await axios.get("/analytics/vendors/by-procedures", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/vendors/by-procedure-type
export const getVendorAnalyticsByProcedureType = async (
  filters?: VendorAnalyticsFilters,
): Promise<VendorByProcedureType[]> => {
  const response = await axios.get("/analytics/vendors/by-procedure-type", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// =============================================
// Analytics – Facilities
// =============================================

export interface FacilityByProcedures {
  facility_id: string;
  facility_name: string;
  total_procedures: number;
}

export interface FacilityByProcedureType {
  facility_id: string;
  facility_name: string;
  procedure_type: string;
  total: number;
}

export interface FacilityByVendor {
  facility_id: string;
  facility_name: string;
  total_vendors: number;
}

// GET /analytics/facilities/by-procedures
export const getFacilityAnalyticsByProcedures = async (
  filters?: VendorAnalyticsFilters,
): Promise<FacilityByProcedures[]> => {
  const response = await axios.get("/analytics/facilities/by-procedures", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/facilities/by-procedure-type
export const getFacilityAnalyticsByProcedureType = async (
  filters?: VendorAnalyticsFilters,
): Promise<FacilityByProcedureType[]> => {
  const response = await axios.get("/analytics/facilities/by-procedure-type", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/facilities/by-vendor
export const getFacilityAnalyticsByVendor = async (
  filters?: VendorAnalyticsFilters,
): Promise<FacilityByVendor[]> => {
  const response = await axios.get("/analytics/facilities/by-vendor", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// =============================================
// Analytics – Reports
// =============================================

export interface ProcedureCostReport {
  vendor?: string;
  facility?: string;
  equipment?: string;
  modality?: string;
  procedure?: string;
  status?: string;
  tariff?: number;
  sha?: number;
  cash?: number;
  vendor_share?: number;
  facility_share?: number;
  [key: string]: unknown;
}

export interface ProcedureCostFilters {
  vendor?: string;
  facility?: string;
  equipment?: string;
  modality?: string;
  procedure?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

// GET /analytics/reports/procedure-costs
export const getProcedureCostReport = async (
  filters?: ProcedureCostFilters,
): Promise<ProcedureCostReport[]> => {
  const response = await axios.get("/analytics/reports/procedure-costs", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/reports/procedure-costs/export
export const exportProcedureCostReport = async (
  filters?: ProcedureCostFilters,
): Promise<Blob> => {
  const response = await axios.get("/analytics/reports/procedure-costs/export", {
    params: filters,
    responseType: "blob",
  });
  return response.data;
};
