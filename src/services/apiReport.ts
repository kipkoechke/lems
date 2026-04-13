import axios from "../lib/axios";

export interface IFacilityReport {
  facility: string;
  total_revenue: number;
  equipments: any[];
}

export interface IVendorReport {
  vendor: string;
  total_revenue: number;
  equipments: any[];
}

export interface ReportForm {
  start_date: Date;
  end_date: Date;
}

export const createFacilityReport = async (
  data: ReportForm,
): Promise<IFacilityReport[]> => {
  const response = await axios.post("/reports/facility-revenue-summary", data);
  return response.data;
};

export const createVendorReport = async (
  data: ReportForm,
): Promise<IVendorReport[]> => {
  const response = await axios.post("/reports/vendor-revenue-summary", data);
  return response.data;
};
