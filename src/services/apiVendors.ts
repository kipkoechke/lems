import axios from "../lib/axios";

export interface Vendor {
  id: string;
  name: string;
  code: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  equipments?: VendorEquipment[];
}

export interface VendorEquipment {
  id: string;
  name: string;
  description: string | null;
  serial_number: string | null;
  model: string | null;
  manufacturer: string | null;
  year: string | null;
  status: string;
  vendor_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface VendorWithEquipments {
  vendor: Vendor;
}

export interface VendorCreateRequest {
  name: string;
  code: string;
  is_active: string;
}

export interface VendorUpdateRequest {
  id: string;
  name: string;
  code: string;
  is_active: string;
}

export interface Contract {
  id: string;
  vendor_id: string;
  facility_id: string;
  lot_id: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  vendor: {
    id: string;
    code: string;
    name: string;
  };
  facility: {
    id: string;
    code: string;
    name: string;
  };
  lot: {
    id: string;
    number: string;
    name: string;
    services?: Array<{
      id: string;
      name: string;
      code: string;
      sha_rate: string;
      vendor_share: string;
      facility_share: string;
      is_capitated: string;
      equipment: {
        id: string;
        name: string;
        serial_number: string;
        status: string;
      };
    }>;
  };
  services?: ContractService[];
}

export interface PaginatedContractsResponse {
  data: Contract[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaginatedContractsResponseOld {
  data: {
    current_page: number;
    data: Contract[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface ContractService {
  service_id: string;
  service_code: string;
  service_name: string;
  is_active: string;
  equipment_id?: string;
}

export interface ContractCreateRequest {
  vendor_id: string;
  facility_id: string;
  lot_id: string;
  is_active: string;
}

export interface ContractUpdateRequest {
  contract_id: string;
  services: ContractServiceUpdate[];
}

export interface ContractServiceUpdate {
  code: string;
  equipment_id?: string;
}

export interface ContractFilterParams {
  facility_code?: string;
  lot_number?: string;
  vendor_code?: string;
  page?: number;
  per_page?: number;
}

// Vendor CRUD operations
export const getVendors = async (): Promise<Vendor[]> => {
  const response = await axios.get<Vendor[]>("/vendors");
  return response.data;
};

export const getVendor = async (vendorCode: string): Promise<Vendor> => {
  const response = await axios.get<Vendor[]>("/vendors");
  const vendor = response.data.find((v) => v.code === vendorCode);
  if (!vendor) {
    throw new Error(`Vendor with code ${vendorCode} not found`);
  }
  return vendor;
};

export const getVendorWithEquipments = async (
  vendorId: string
): Promise<VendorWithEquipments> => {
  const response = await axios.get<VendorWithEquipments>(
    `/vendors/${vendorId}`
  );
  return response.data;
};

export const createVendor = async (
  data: VendorCreateRequest
): Promise<Vendor> => {
  const response = await axios.post<Vendor>("/vendors", data);
  return response.data;
};

export const updateVendor = async (
  data: VendorUpdateRequest
): Promise<Vendor> => {
  const response = await axios.post<Vendor>("/vendors", data);
  return response.data;
};

export const deleteVendor = async (id: string): Promise<void> => {
  await axios.delete(`/vendors/${id}`);
};

// Contract operations
export const getContracts = async (
  params?: ContractFilterParams
): Promise<PaginatedContractsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.facility_code)
    queryParams.append("facility_code", params.facility_code);
  if (params?.lot_number) queryParams.append("lot_number", params.lot_number);
  if (params?.vendor_code)
    queryParams.append("vendor_code", params.vendor_code);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());

  const url = `contracts${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await axios.get<PaginatedContractsResponse>(url);

  // Normalize the data: copy lot.services to contract.services for backward compatibility
  const normalizedContracts = response.data.data.map((contract) => ({
    ...contract,
    services:
      contract.lot.services?.map((service) => ({
        service_id: service.id,
        service_code: service.code,
        service_name: service.name,
        is_active: "1", // All services from API are active
        equipment_id: service.equipment?.id,
      })) || [],
  }));

  return {
    data: normalizedContracts,
    pagination: response.data.pagination,
  };
};

export const createContract = async (
  data: ContractCreateRequest
): Promise<Contract> => {
  const response = await axios.post<Contract>("contracts", data);
  return response.data;
};

export const updateContractServices = async (
  data: ContractUpdateRequest
): Promise<Contract> => {
  const response = await axios.post<Contract>("/upsert/contract", data);
  return response.data;
};
