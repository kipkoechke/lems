import axios from "../lib/axios";
import type { VendorBookingsResponse, VendorBookingsParams } from "@/types/booking";

// ============================================================
// Shared type aliases
// ============================================================

export type VendorContactType = "technical" | "support" | "finance" | "general";
export type VendorLifecycleState = "active" | "disabled" | "retired";

// ============================================================
// Types
// ============================================================

/**
 * A vendor contact.
 *
 * The live vendor detail payload embeds a trimmed `{name, email, phone, role}`
 * shape with no id. The richer fields below come from the dedicated
 * /vendors/{id}/contacts CRUD endpoints, so everything is optional and read
 * through the accessors underneath.
 */
export interface VendorContact {
  id?: string;
  name?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  contact_type?: VendorContactType;
  title?: string;
  department?: string;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Full name, whichever shape the API returned. */
export const vendorContactName = (contact: VendorContact): string =>
  contact.name ||
  [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
  "-";

/** The contact's role/title, whichever field is populated. */
export const vendorContactRole = (contact: VendorContact): string =>
  contact.role || contact.title || contact.contact_type || "-";

export interface VendorModality {
  id: string;
  category?: string;
  name?: string;
  code?: string;
  status?: string;
  label?: string;
}

export interface Vendor {
  id: string;
  name: string;
  // The live /vendors payload returns `code` + `is_active`. The richer
  // reference fields below are optional because the API does not (yet) send
  // them on the list/detail responses — treat them as may-be-absent rather
  // than assuming, or every vendor renders as code-less and "Retired".
  code?: string;
  is_active?: boolean;
  vendor_alpha_code?: string;
  dha_vendor_code?: string;
  sha_vendor_code?: string;
  description?: string | null;
  address?: string | null;
  country?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  financial_details?: Record<string, unknown> | null;
  lifecycle_state?: VendorLifecycleState;
  contacts?: VendorContact[];
  equipment_count?: number;
  modalities?: VendorModality[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/** Display code for a vendor, whichever field the API populated. */
export const vendorCode = (vendor: Vendor): string =>
  vendor.vendor_alpha_code || vendor.code || "-";

/**
 * Whether a vendor is active. Prefers `lifecycle_state` when present and falls
 * back to the boolean `is_active` the list endpoint actually returns.
 */
export const isVendorActive = (vendor: Vendor): boolean =>
  vendor.lifecycle_state
    ? vendor.lifecycle_state === "active"
    : vendor.is_active === true;

/** Human-readable status label matching the same precedence. */
export const vendorStatusLabel = (vendor: Vendor): string =>
  vendor.lifecycle_state ?? (vendor.is_active ? "active" : "inactive");

export interface VendorListResponse {
  data: Vendor[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface VendorDetailResponse {
  data: Vendor;
}

export interface VendorCreateRequest {
  vendor_alpha_code: string;
  dha_vendor_code: string;
  sha_vendor_code: string;
  name: string;
  description?: string;
  address?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  financial_details?: Record<string, unknown>;
  lifecycle_state?: VendorLifecycleState;
  modality_ids?: string[];
}

export interface VendorUpdateRequest {
  vendor_alpha_code?: string;
  dha_vendor_code?: string;
  sha_vendor_code?: string;
  name?: string;
  description?: string;
  address?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  financial_details?: Record<string, unknown>;
  lifecycle_state?: VendorLifecycleState;
  modality_ids?: string[];
}

export interface VendorListParams {
  lifecycle_state?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// Contact types
export interface VendorContactCreateRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  contact_type: VendorContactType;
  title?: string;
  department?: string;
  is_primary?: boolean;
}

export interface VendorContactUpdateRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  contact_type?: VendorContactType;
  title?: string;
  department?: string;
  is_primary?: boolean;
}

// Dropdown config types
export interface DropdownConfig {
  id: string;
  category: string;
  name: string;
  code: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface DropdownConfigCreateRequest {
  category: string;
  name: string;
  code: string;
  status?: string;
}

export interface DropdownConfigUpdateRequest {
  category?: string;
  name?: string;
  code?: string;
  status?: string;
}

// Modality alias types
export interface ModalityAlias {
  id: string;
  category: string;
  name: string;
  code: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Booking types for vendor
export interface VendorBooking {
  id: string;
  booking_number: string;
  patient: {
    id: string;
    name: string;
    identification_no?: string;
  };
  facility: {
    id: string;
    name: string;
    fr_code: string;
  };
  status: string;
  services_count?: number;
  total_tariff?: string;
  created_at: string;
  updated_at?: string;
}

// ============================================================
// Contracts Types (kept compatible)
// ============================================================

export interface Contract {
  id: string;
  contract_number: string;
  vendor_id: string;
  facility_id: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "expired" | "pending";
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  vendor: {
    id: string;
    name: string;
    code: string;
  };
  facility: {
    id: string;
    name: string;
    code: string;
  };
  creator: {
    id: string;
    name: string;
  } | null;
}

interface PaginatedContractsResponse {
  data: Contract[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface ContractServiceItem {
  id: string;
  service: {
    id: string;
    code: string;
    name: string;
    tariff: number;
  };
  equipment: {
    id: string;
    code: string;
    name: string;
  };
  is_active: boolean;
}

export interface ContractLotWithServices {
  lot: {
    id: string;
    number: string;
    name: string;
  };
  services: ContractServiceItem[];
}

interface ContractServicesResponse {
  contract: {
    id: string;
    contract_number: string;
  };
  total_services: number;
  data: ContractLotWithServices[];
}

export interface ContractCreateRequest {
  vendor_id: string;
  facility_id: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
}

export interface ContractFilterParams {
  facility_code?: string;
  lot_number?: string;
  vendor_id?: string;
  page?: number;
  per_page?: number;
}

// ============================================================
// Vendor CRUD
// ============================================================

// GET /vendors — list vendors
export const getVendors = async (
  params: VendorListParams = {},
): Promise<Vendor[]> => {
  const response = await axios.get<VendorListResponse>("/vendors", { params });
  return response.data.data;
};

// GET /vendors/{id} — get single vendor by ID
export const getVendor = async (vendorId: string): Promise<Vendor> => {
  const response = await axios.get<VendorDetailResponse>(
    `/vendors/${vendorId}`,
  );
  return response.data.data;
};

/**
 * The signed-in vendor's own record.
 *
 * Vendor-portal routes live under /vendor/* and infer the vendor from the auth
 * token, so this works even when the login payload carries no vendor entity —
 * which is exactly when the id-based lookup below fires no request at all.
 * `vendorId` is only used for the fallback, for deployments still on the
 * documented /vendors/{vendor} route.
 */
export const getMyVendorProfile = async (
  vendorId?: string,
): Promise<Vendor> => {
  // The documented route is /vendors/{vendor}; try it first when we know the
  // id. /vendor/profile is not part of the API — it 404s — so it is only a
  // last resort for sessions that carry no vendor id at all.
  if (vendorId) return getVendor(vendorId);

  const response = await axios.get<VendorDetailResponse>("/vendor/profile");
  return response.data.data ?? response.data;
};

export const updateMyVendorProfile = async (
  data: VendorUpdateRequest,
  vendorId?: string,
): Promise<Vendor> => {
  if (vendorId) return updateVendor(vendorId, data);

  const response = await axios.put<{ data: Vendor }>("/vendor/profile", data);
  return response.data.data ?? response.data;
};

// POST /vendors — create vendor
export const createVendor = async (
  data: VendorCreateRequest,
): Promise<Vendor> => {
  const response = await axios.post<{ data: Vendor }>("/vendors", data);
  return response.data.data ?? response.data;
};

// PUT /vendors/{id} — update vendor
export const updateVendor = async (
  vendorId: string,
  data: VendorUpdateRequest,
): Promise<Vendor> => {
  const response = await axios.put<{ data: Vendor }>(
    `/vendors/${vendorId}`,
    data,
  );
  return response.data.data ?? response.data;
};

// DELETE /vendors/{id} — soft-delete vendor (marks as retired)
export const deleteVendor = async (id: string): Promise<void> => {
  await axios.delete(`/vendors/${id}`);
};

// ============================================================
// Vendor Contacts
// ============================================================

// GET /vendors/{vendorId}/contacts
export const getVendorContacts = async (
  vendorId: string,
): Promise<VendorContact[]> => {
  const response = await axios.get<{ data: VendorContact[] }>(
    `/vendors/${vendorId}/contacts`,
  );
  return response.data.data ?? response.data;
};

// POST /vendors/{vendorId}/contacts
export const createVendorContact = async (
  vendorId: string,
  data: VendorContactCreateRequest,
): Promise<VendorContact> => {
  const response = await axios.post<{ data: VendorContact }>(
    `/vendors/${vendorId}/contacts`,
    data,
  );
  return response.data.data ?? response.data;
};

// PUT /vendors/{vendorId}/contacts/{contactId}
export const updateVendorContact = async (
  vendorId: string,
  contactId: string,
  data: VendorContactUpdateRequest,
): Promise<VendorContact> => {
  const response = await axios.put<{ data: VendorContact }>(
    `/vendors/${vendorId}/contacts/${contactId}`,
    data,
  );
  return response.data.data ?? response.data;
};

// DELETE /vendors/{vendorId}/contacts/{contactId}
export const deleteVendorContact = async (
  vendorId: string,
  contactId: string,
): Promise<void> => {
  await axios.delete(`/vendors/${vendorId}/contacts/${contactId}`);
};

// ============================================================
// Vendor Modalities
// ============================================================

// GET /vendors/modalities — list modality aliases
export const getModalities = async (): Promise<ModalityAlias[]> => {
  const response = await axios.get<{ data: ModalityAlias[] }>(
    "/vendors/modalities",
  );
  return response.data.data ?? response.data;
};

// POST /vendors/modalities — create modality alias
export const createModality = async (
  data: DropdownConfigCreateRequest,
): Promise<ModalityAlias> => {
  const response = await axios.post<{ data: ModalityAlias }>(
    "/vendors/modalities",
    data,
  );
  return response.data.data ?? response.data;
};

// PUT /vendors/modalities/{id} — update modality alias
export const updateModality = async (
  id: string,
  data: DropdownConfigUpdateRequest,
): Promise<ModalityAlias> => {
  const response = await axios.put<{ data: ModalityAlias }>(
    `/vendors/modalities/${id}`,
    data,
  );
  return response.data.data ?? response.data;
};

// GET /vendors/{vendorId}/modalities — get vendor modality associations
export const getVendorModalities = async (
  vendorId: string,
): Promise<VendorModality[]> => {
  const response = await axios.get<{ data: VendorModality[] }>(
    `/vendors/${vendorId}/modalities`,
  );
  return response.data.data ?? response.data;
};

// POST /vendors/{vendorId}/modalities — add modality associations
export const addVendorModalities = async (
  vendorId: string,
  modalityIds: string[],
): Promise<void> => {
  await axios.post(`/vendors/${vendorId}/modalities`, {
    modality_ids: modalityIds,
  });
};

// PUT /vendors/{vendorId}/modalities — replace modality associations
export const replaceVendorModalities = async (
  vendorId: string,
  modalityIds: string[],
): Promise<void> => {
  await axios.put(`/vendors/${vendorId}/modalities`, {
    modality_ids: modalityIds,
  });
};

// ============================================================
// Dropdown Config
// ============================================================

// GET /vendors/dropdown-config
export const getDropdownConfig = async (params?: {
  category?: string;
  status?: string;
}): Promise<DropdownConfig[]> => {
  const response = await axios.get<{ data: DropdownConfig[] }>(
    "/vendors/dropdown-config",
    { params },
  );
  return response.data.data ?? response.data;
};

// POST /vendors/dropdown-config
export const createDropdownConfig = async (
  data: DropdownConfigCreateRequest,
): Promise<DropdownConfig> => {
  const response = await axios.post<{ data: DropdownConfig }>(
    "/vendors/dropdown-config",
    data,
  );
  return response.data.data ?? response.data;
};

// PUT /vendors/dropdown-config/{id}
export const updateDropdownConfig = async (
  id: string,
  data: DropdownConfigUpdateRequest,
): Promise<DropdownConfig> => {
  const response = await axios.put<{ data: DropdownConfig }>(
    `/vendors/dropdown-config/${id}`,
    data,
  );
  return response.data.data ?? response.data;
};

// ============================================================
// Vendor Bookings
// ============================================================

// GET /vendor/bookings — vendor inferred from auth token
export const getVendorBookings = async (
  _vendorId: string,
): Promise<VendorBooking[]> => {
  const response = await axios.get<{ data: VendorBooking[] }>(
    `/vendor/bookings`,
  );
  return response.data.data ?? response.data;
};

// GET /vendor/bookings — paginated with filters (new response format)
export const getVendorBookingsPaginated = async (
  params: VendorBookingsParams = {},
): Promise<VendorBookingsResponse> => {
  const response = await axios.get<VendorBookingsResponse>(`/vendor/bookings`, { params });
  return response.data;
};

// ============================================================
// Contracts
// ============================================================

export const getContracts = async (
  params?: ContractFilterParams,
): Promise<PaginatedContractsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.facility_code)
    queryParams.append("facility_code", params.facility_code);
  if (params?.lot_number) queryParams.append("lot_number", params.lot_number);
  if (params?.vendor_id) queryParams.append("vendor_id", params.vendor_id);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());

  const url = `contracts${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await axios.get<PaginatedContractsResponse>(url);
  return response.data;
};

// GET /contracts/{id}
export const getContract = async (contractId: string): Promise<Contract> => {
  const response = await axios.get<{ data: Contract }>(
    `contracts/${contractId}`,
  );
  return response.data.data;
};

// GET /contracts/{contractId}/services
export const getContractServices = async (
  contractId: string,
): Promise<ContractServicesResponse> => {
  const response = await axios.get<ContractServicesResponse>(
    `contracts/${contractId}/services`,
  );
  return response.data;
};

// POST /contracts
export const createContract = async (
  data: ContractCreateRequest,
): Promise<Contract> => {
  const response = await axios.post<Contract>("contracts", data);
  return response.data;
};
