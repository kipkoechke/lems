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
  vendor_code: string;
  vendor_name: string;
  facility_code: string;
  facility_name: string;
  lot_number: string;
  lot_name: string;
  is_active: string;
  services: ContractService[];
}

export interface ContractService {
  service_id: string;
  service_code: string;
  service_name: string;
  is_active: string;
  equipment_id?: string;
}

export interface ContractCreateRequest {
  vendor_code: string;
  facility_code: string;
  lot_number: string;
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
  const response = await axios.post<Vendor>("/vendors/upsert", data);
  return response.data;
};

export const updateVendor = async (
  data: VendorUpdateRequest
): Promise<Vendor> => {
  const response = await axios.post<Vendor>("/vendors/upsert", data);
  return response.data;
};

export const deleteVendor = async (id: string): Promise<void> => {
  await axios.delete(`/vendors/${id}`);
};

// Contract operations
export const getContracts = async (
  params?: ContractFilterParams
): Promise<Contract[]> => {
  const queryParams = new URLSearchParams();
  if (params?.facility_code)
    queryParams.append("facility_code", params.facility_code);
  if (params?.lot_number) queryParams.append("lot_number", params.lot_number);
  if (params?.vendor_code)
    queryParams.append("vendor_code", params.vendor_code);

  const url = `/vendor/facility/contracts${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await axios.get<Contract[]>(url);
  return response.data;
};

export const createContract = async (
  data: ContractCreateRequest
): Promise<Contract> => {
  const response = await axios.post<Contract>(
    "/vendor/facility/contract",
    data
  );
  return response.data;
};

export const updateContractServices = async (
  data: ContractUpdateRequest
): Promise<Contract> => {
  const response = await axios.post<Contract>("/upsert/contract", data);
  return response.data;
};
