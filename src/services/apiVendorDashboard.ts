import axios from "../lib/axios";

// =============================================
// NEW Vendor Dashboard API Types (v2)
// =============================================

export interface VendorInfo {
  id: string;
  name: string;
  code: string;
}

export interface DashboardPeriod {
  from: string;
  to: string;
}

export interface EquipmentStats {
  total: number;
  by_status: {
    active: number;
    maintenance: number;
    decommissioned: number;
    pending: number;
  };
}

export interface BookingStats {
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

export interface RevenueStats {
  tariff: string;
  vendor_share: string;
  facility_share: string;
  by_payment_type: {
    sha: string;
    cash: string;
    other_insurance: string;
  };
}

export interface PatientStats {
  unique_count: number;
}

export interface FacilityItem {
  id: string;
  name: string;
  fr_code: string;
}

export interface FacilitiesStats {
  count: number;
  list: FacilityItem[];
}

export interface LotItem {
  id: string;
  number: string;
  name: string;
}

export interface LotsStats {
  count: number;
  list: LotItem[];
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
}

export interface ServicesStats {
  count: number;
  list: ServiceItem[];
}

export interface TrendlineDataPoint {
  period: string;
  sha: string;
  cash: string;
  other_insurance: string;
  vendor_share: string;
  total: string;
  services_count: number;
}

export interface TrendlineStats {
  grouping: string;
  data: TrendlineDataPoint[];
}

export interface VendorDashboardResponse {
  vendor: VendorInfo;
  period: DashboardPeriod;
  equipment: EquipmentStats;
  bookings: BookingStats;
  revenue: RevenueStats;
  patients: PatientStats;
  facilities: FacilitiesStats;
  lots: LotsStats;
  services: ServicesStats;
  trendline: TrendlineStats;
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

// Get vendor dashboard data (NEW v2 endpoint)
export const getVendorDashboard = async (
  vendorId: string,
  filters?: VendorDashboardFilters,
): Promise<VendorDashboardResponse> => {
  const params: Record<string, string> = {};

  if (filters?.from) params.from = filters.from;
  if (filters?.to) params.to = filters.to;
  if (filters?.facility_id) params.facility_id = filters.facility_id;
  if (filters?.lot_id) params.lot_id = filters.lot_id;
  if (filters?.service_id) params.service_id = filters.service_id;
  if (filters?.grouping) params.grouping = filters.grouping;

  const response = await axios.get(`/vendors/${vendorId}/dashboard`, {
    params,
  });
  return response.data.data;
};

// =============================================
// Legacy Types (kept for backward compatibility)
// =============================================

export interface VendorDashboardSummary {
  total_equipments: number;
  total_facilities_served: number;
  total_revenue: number;
  total_bookings: number;
  total_lots: number;
  total_services: number;
  pending_maintenance: number;
  active_contracts: number;
}

export interface EquipmentUsageTrend {
  date: string;
  usage_count: number;
  revenue: number;
  equipment_name?: string;
  facility_name?: string;
  lot_name?: string;
  service_name?: string;
}

export interface VendorTrendsResponse {
  trends: EquipmentUsageTrend[];
  summary: {
    total_usage: number;
    total_revenue: number;
    average_daily_usage: number;
  };
}

export interface VendorTrendFilters {
  vendor_code: string;
  start_date?: string;
  end_date?: string;
  county_code?: string;
  sub_county_code?: string;
  facility_code?: string;
  lot_number?: string;
  service_code?: string;
  equipment_id?: string;
  period?: "daily" | "weekly" | "monthly";
}

export interface FacilityRevenue {
  facility_code: string;
  facility_name: string;
  total_revenue: number;
  total_bookings: number;
  vendor_share: number;
}

export interface LotRevenue {
  lot_number: string;
  lot_name: string;
  total_revenue: number;
  total_bookings: number;
  vendor_share: number;
}

export interface ServiceRevenue {
  service_code: string;
  service_name: string;
  total_revenue: number;
  total_bookings: number;
  vendor_share: number;
}

// Get equipment usage trends
export const getVendorEquipmentTrends = async (
  filters: VendorTrendFilters,
): Promise<VendorTrendsResponse> => {
  try {
    const response = await axios.get(`/vendor/equipment-trends`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.warn("Vendor trends API not available, using mock data");
    return {
      trends: [],
      summary: {
        total_usage: 0,
        total_revenue: 0,
        average_daily_usage: 0,
      },
    };
  }
};

// Get revenue by facility
export const getVendorRevenueByFacility = async (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>,
): Promise<FacilityRevenue[]> => {
  try {
    const response = await axios.get(`/vendor/revenue-by-facility`, {
      params: { vendor_code: vendorCode, ...filters },
    });
    return response.data;
  } catch (error) {
    console.warn("Vendor revenue by facility API not available");
    return [];
  }
};

// Get revenue by lot
export const getVendorRevenueByLot = async (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>,
): Promise<LotRevenue[]> => {
  try {
    const response = await axios.get(`/vendor/revenue-by-lot`, {
      params: { vendor_code: vendorCode, ...filters },
    });
    return response.data;
  } catch (error) {
    console.warn("Vendor revenue by lot API not available");
    return [];
  }
};

// Get revenue by service
export const getVendorRevenueByService = async (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>,
): Promise<ServiceRevenue[]> => {
  try {
    const response = await axios.get(`/vendor/revenue-by-service`, {
      params: { vendor_code: vendorCode, ...filters },
    });
    return response.data;
  } catch (error) {
    console.warn("Vendor revenue by service API not available");
    return [];
  }
};

// Use existing booking trends API filtered by vendor
export const getVendorBookingTrends = async (
  vendorCode: string,
  filters?: Partial<VendorTrendFilters>,
): Promise<any> => {
  const params: Record<string, string> = {
    vendor_code: vendorCode,
    approval_status: "approved",
  };

  if (filters?.start_date) params.start_date = filters.start_date;
  if (filters?.end_date) params.end_date = filters.end_date;
  if (filters?.county_code) params.county_code = filters.county_code;
  if (filters?.sub_county_code)
    params.sub_county_code = filters.sub_county_code;
  if (filters?.facility_code) params.facility_code = filters.facility_code;
  if (filters?.lot_number) params.lot_number = filters.lot_number;
  if (filters?.service_code) params.service_code = filters.service_code;

  const response = await axios.get("bookings/trends", { params });
  return response.data;
};
