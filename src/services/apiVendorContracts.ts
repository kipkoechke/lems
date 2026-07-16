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

export interface VendorContractSummary {
  total: number;
  active: number;
  expired: number;
  facilities: number;
}

export interface VendorContractsParams {
  status?: string;
  page?: number;
  per_page?: number;
}

/** Normalised pagination — see `normalisePagination` for why. */
export interface VendorContractsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface VendorContractsResult {
  contracts: VendorContract[];
  summary?: VendorContractSummary;
  pagination?: VendorContractsPagination;
}

/**
 * The vendor contracts endpoint reports pages as `total_pages` and omits
 * `from`/`to`, unlike the admin endpoints which send `last_page`/`from`/`to`.
 * Normalise here so the shared Pagination component gets one shape.
 */
interface RawPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages?: number;
  last_page?: number;
  from?: number;
  to?: number;
}

const normalisePagination = (
  raw?: RawPagination,
): VendorContractsPagination | undefined => {
  if (!raw) return undefined;

  const lastPage = raw.last_page ?? raw.total_pages ?? 1;
  const from = raw.from ?? (raw.current_page - 1) * raw.per_page + 1;
  const to = raw.to ?? Math.min(raw.current_page * raw.per_page, raw.total);

  return {
    current_page: raw.current_page,
    last_page: lastPage,
    per_page: raw.per_page,
    total: raw.total,
    from,
    to,
  };
};

interface VendorContractsResponse {
  data: VendorContract[];
  summary?: VendorContractSummary;
  pagination?: RawPagination;
}

// GET /vendor/contracts
export const getVendorContracts = async (
  params: VendorContractsParams = {},
): Promise<VendorContractsResult> => {
  const response = await axios.get<VendorContractsResponse | VendorContract[]>(
    "/vendor/contracts",
    { params },
  );

  if (Array.isArray(response.data)) {
    return { contracts: response.data };
  }

  return {
    contracts: response.data.data ?? [],
    summary: response.data.summary,
    pagination: normalisePagination(response.data.pagination),
  };
};

export interface VendorContractServiceItem {
  id: string;
  service?: {
    id?: string;
    code?: string;
    name?: string;
    tariff?: number | string;
  } | null;
  equipment?: {
    id?: string;
    code?: string;
    name?: string;
  } | null;
  is_active?: boolean;
}

export interface VendorContractDetail extends VendorContract {
  services?: VendorContractServiceItem[];
}

// GET /vendor/contracts/{id}
export const getVendorContract = async (
  contractId: string,
): Promise<VendorContractDetail> => {
  const response = await axios.get<
    { data: VendorContractDetail } | VendorContractDetail
  >(`/vendor/contracts/${contractId}`);

  const body = response.data as { data?: VendorContractDetail };
  return body.data ?? (response.data as VendorContractDetail);
};

// GET /vendor/contracts/{id}/services
export const getVendorContractServices = async (
  contractId: string,
): Promise<VendorContractServiceItem[]> => {
  const response = await axios.get<
    { data: VendorContractServiceItem[] } | VendorContractServiceItem[]
  >(`/vendor/contracts/${contractId}/services`);

  if (Array.isArray(response.data)) return response.data;
  return response.data.data ?? [];
};
