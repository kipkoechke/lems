import axios from "../lib/axios";

// ============================================================
// Reports via Analytics
// Uses the /analytics/reports/procedure-costs endpoints
// ============================================================

export interface IFacilityReport {
  facility?: string;
  vendor?: string;
  total_revenue: number;
  equipments: Array<{
    equipment: string;
    equipment_total_revenue: number;
    services: Array<{
      service: string;
      service_total_revenue: number;
    }>;
  }>;
}

export type IVendorReport = IFacilityReport;

export interface ReportForm {
  start_date: string;
  end_date: string;
}

export interface ProcedureCostReportFilters {
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
  filters?: ProcedureCostReportFilters,
): Promise<IFacilityReport[]> => {
  const response = await axios.get("/analytics/reports/procedure-costs", {
    params: filters,
  });
  return response.data.data ?? response.data;
};

// GET /analytics/reports/procedure-costs/export
export const exportProcedureCosts = async (
  filters?: ProcedureCostReportFilters,
): Promise<Blob> => {
  const response = await axios.get(
    "/analytics/reports/procedure-costs/export",
    {
      params: filters,
      responseType: "blob",
    },
  );
  return response.data;
};
