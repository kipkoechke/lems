import axios from "../lib/axios";

// Vendor Dashboard Summary
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

// Equipment Usage Trend
export interface EquipmentUsageTrend {
  date: string;
  usage_count: number;
  revenue: number;
  equipment_name?: string;
  facility_name?: string;
  lot_name?: string;
  service_name?: string;
}

// Vendor Trends Response
export interface VendorTrendsResponse {
  trends: EquipmentUsageTrend[];
  summary: {
    total_usage: number;
    total_revenue: number;
    average_daily_usage: number;
  };
}

// Filter params for vendor trends
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

// Revenue by Facility
export interface FacilityRevenue {
  facility_code: string;
  facility_name: string;
  total_revenue: number;
  total_bookings: number;
  vendor_share: number;
}

// Revenue by Lot
export interface LotRevenue {
  lot_number: string;
  lot_name: string;
  total_revenue: number;
  total_bookings: number;
  vendor_share: number;
}

// Revenue by Service
export interface ServiceRevenue {
  service_code: string;
  service_name: string;
  total_revenue: number;
  total_bookings: number;
  vendor_share: number;
}

// Get vendor dashboard summary
export const getVendorDashboardSummary = async (
  vendorCode: string
): Promise<VendorDashboardSummary> => {
  try {
    const response = await axios.get(`/vendor/dashboard`, {
      params: { vendor_code: vendorCode },
    });
    return response.data;
  } catch (error) {
    // Return mock data for now if API is not ready
    console.warn("Vendor dashboard API not available, using mock data");
    return {
      total_equipments: 0,
      total_facilities_served: 0,
      total_revenue: 0,
      total_bookings: 0,
      total_lots: 0,
      total_services: 0,
      pending_maintenance: 0,
      active_contracts: 0,
    };
  }
};

// Get equipment usage trends
export const getVendorEquipmentTrends = async (
  filters: VendorTrendFilters
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
  filters?: Partial<VendorTrendFilters>
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
  filters?: Partial<VendorTrendFilters>
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
  filters?: Partial<VendorTrendFilters>
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
  filters?: Partial<VendorTrendFilters>
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
