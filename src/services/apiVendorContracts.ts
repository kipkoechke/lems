import axios from "../lib/axios";

/**
 * Vendor-portal contracts. Like the rest of the /vendor/* surface, the vendor
 * is inferred from the auth token — no vendor id is passed.
 */
export interface VendorContract {
  id: string;
  contract_number: string;
  vendor?: {
    id?: string;
    name?: string;
    code?: string;
  } | null;
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
  // The list response now embeds the full service lines, not just a count.
  services?: VendorContractServiceItem[];
  notes?: string | null;
  created_by?: string | null;
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

/**
 * A contracted service line.
 *
 * The live API nests the SHA service under `service` and carries the lot per
 * line rather than on the contract. Older/documented responses flattened
 * `code`/`name`/`tariff` onto the item, so both are modelled and read through
 * the accessors below.
 */
export interface VendorContractServiceItem {
  id: string;
  service?: {
    id?: string;
    code?: string;
    name?: string;
    tariff?: number | string;
  } | null;
  code?: string;
  name?: string;
  tariff?: number | string;
  lot?: {
    id?: string;
    number?: string;
    name?: string;
  } | null;
  equipment?: {
    id?: string;
    code?: string;
    name?: string;
    category?: string;
    status?: string;
  } | null;
  is_active?: boolean;
}

export const contractServiceCode = (s: VendorContractServiceItem): string =>
  s.service?.code || s.code || "";

export const contractServiceName = (s: VendorContractServiceItem): string =>
  s.service?.name || s.name || "-";

export const contractServiceTariff = (
  s: VendorContractServiceItem,
): number | string | undefined => s.service?.tariff ?? s.tariff;

export interface VendorContractDetail extends VendorContract {
  services?: VendorContractServiceItem[];
}

/**
 * The lot a contract covers. No longer sent on the contract itself — it now
 * hangs off each service line, so read it from the first one.
 */
export const contractLot = (
  contract: VendorContract & { services?: VendorContractServiceItem[] },
): { number?: string; name?: string } | null =>
  contract.lot ?? contract.services?.[0]?.lot ?? null;

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
