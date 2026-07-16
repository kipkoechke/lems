import axios from "../lib/axios";

export interface RevenueDistribution {
  id: string;
  vendor_percentage: number;
  facility_percentage: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RevenueDistributionCreateRequest {
  vendor_percentage: number;
  facility_percentage: number;
  start_date: string;
  end_date: string;
  active?: boolean;
}

export type RevenueDistributionUpdateRequest =
  Partial<RevenueDistributionCreateRequest>;

// GET /settings/revenue-distributions
export const getRevenueDistributions = async (): Promise<
  RevenueDistribution[]
> => {
  const response = await axios.get<{ data: RevenueDistribution[] }>(
    "/settings/revenue-distributions",
  );
  return response.data.data ?? (response.data as unknown as RevenueDistribution[]);
};

// POST /settings/revenue-distributions
export const createRevenueDistribution = async (
  data: RevenueDistributionCreateRequest,
): Promise<RevenueDistribution> => {
  const response = await axios.post<{ data: RevenueDistribution }>(
    "/settings/revenue-distributions",
    data,
  );
  return (
    response.data.data ?? (response.data as unknown as RevenueDistribution)
  );
};

// PUT /settings/revenue-distributions/{id}
export const updateRevenueDistribution = async (
  distributionId: string,
  data: RevenueDistributionUpdateRequest,
): Promise<RevenueDistribution> => {
  const response = await axios.put<{ data: RevenueDistribution }>(
    `/settings/revenue-distributions/${distributionId}`,
    data,
  );
  return (
    response.data.data ?? (response.data as unknown as RevenueDistribution)
  );
};
