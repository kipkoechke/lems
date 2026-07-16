import axios from "../lib/axios";

// =============================================
// Vendor Dashboard API Types
// =============================================

export interface VendorDashboardVendorInfo {
  id: string;
  name: string;
  code: string;
}

export interface VendorDashboardPeriod {
  from: string;
  to: string;
}

export interface VendorDashboardEquipmentStats {
  total: number;
  by_status: {
    active: number;
    maintenance: number;
    decommissioned: number;
    pending: number;
  };
}

export interface VendorDashboardBookingStats {
  total_bookings: number;
  total_services: number;
  by_service_status: {
    not_started: number;
    completed: number;
    cancelled: number;
  };
  by_source: {
    standalone: number;
    hmis: number;
    provider_portal: number;
  };
}

export interface VendorDashboardRevenueStats {
  tariff: string;
  vendor_share: string;
  facility_share: string;
  by_payment_type: {
    sha: string;
    cash: string;
    other_insurance: string;
  };
}

export interface VendorDashboardPatientStats {
  unique_count: number;
}

export interface VendorDashboardFacilityItem {
  id: string;
  name: string;
  fr_code: string;
}

export interface VendorDashboardFacilitiesStats {
  count: number;
  list: VendorDashboardFacilityItem[];
}

export interface VendorDashboardLotItem {
  id: string;
  number: string;
  name: string;
}

export interface VendorDashboardLotsStats {
  count: number;
  list: VendorDashboardLotItem[];
}

export interface VendorDashboardServiceItem {
  id: string;
  code: string;
  name: string;
}

export interface VendorDashboardServicesStats {
  count: number;
  list: VendorDashboardServiceItem[];
}

export interface VendorDashboardTrendlineDataPoint {
  period: string;
  sha: string;
  cash: string;
  other_insurance: string;
  vendor_share: string;
  total: string;
  services_count: number;
}

export interface VendorDashboardTrendlineStats {
  grouping: string;
  data: VendorDashboardTrendlineDataPoint[];
}

export interface VendorDashboardResponse {
  vendor: VendorDashboardVendorInfo;
  period: VendorDashboardPeriod;
  equipment: VendorDashboardEquipmentStats;
  bookings: VendorDashboardBookingStats;
  revenue: VendorDashboardRevenueStats;
  patients: VendorDashboardPatientStats;
  facilities: VendorDashboardFacilitiesStats;
  lots: VendorDashboardLotsStats;
  services: VendorDashboardServicesStats;
  trendline: VendorDashboardTrendlineStats;
}

// Filter params for vendor dashboard
export interface VendorDashboardFilters {
  from?: string;
  to?: string;
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
