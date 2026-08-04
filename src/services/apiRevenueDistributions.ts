import axios from "../lib/axios";

export interface RevenueDistribution {
  id: string;
  lot_id: string;
  name: string;
  code: string;
  tariff: string;
  vendor_share: string;
  facility_share: string;
  capitated: boolean;
  is_active: boolean;
  modality?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RevenueDistributionListResponse {
  data: RevenueDistribution[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface RevenueDistributionParams {
  page?: number;
  per_page?: number;
  search?: string;
  lot_id?: string;
  is_active?: boolean;
}

// GET /settings/revenue-distributions
export const getRevenueDistributions = async (
  params: RevenueDistributionParams = {},
): Promise<RevenueDistributionListResponse> => {
  const response = await axios.get<RevenueDistributionListResponse>(
    "/settings/revenue-distributions",
    { params },
  );
  return response.data;
};
