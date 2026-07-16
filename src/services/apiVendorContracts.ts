import axios from "../lib/axios";

/**
 * Vendor-portal contracts. Like the rest of the /vendor/* surface, the vendor
 * is inferred from the auth token — no vendor id is passed.
 */
export interface VendorContract {
  id: string;
  contract_number: string;
  facility?: {
    id?: string;
    name?: string;
    code?: string;
    fr_code?: string;
  } | null;
  lot?: {
    id?: string;
    number?: string;
    name?: string;
  } | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  services_count?: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VendorContractsParams {
  status?: string;
  page?: number;
  per_page?: number;
}

export interface VendorContractsResult {
  contracts: VendorContract[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// GET /vendor/contracts
export const getVendorContracts = async (
  params: VendorContractsParams = {},
): Promise<VendorContractsResult> => {
  const response = await axios.get<
    { data: VendorContract[]; pagination?: VendorContractsResult["pagination"] } | VendorContract[]
  >("/vendor/contracts", { params });

  if (Array.isArray(response.data)) {
    return { contracts: response.data };
  }

  return {
    contracts: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};
