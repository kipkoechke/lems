import axios from "../lib/axios";

export interface ServiceCategory {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  contactInfo: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EquipmentWithService {
  equipmentId: string;
  equipmentName: string;
  serialNumber?: string | null;
  status: string;
  vendorShare: string;
  facilityShare: string;
  capitated: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
  category: ServiceCategory;
  services: string;
}

// ============ Vendor Equipment Types & API ============

export interface VendorEquipmentSpecifications {
  [key: string]: string | number | undefined;
}

export interface VendorEquipment {
  id: string;
  code: string;
  name: string;
  serial_number: string;
  model: string;
  brand: string;
  manufacture_date: string;
  category: string;
  category_label: string;
  status:
    | "active"
    | "inactive"
    | "maintenance"
    | "decommissioned"
    | "pending_installation";
  status_label: string;
  description: string;
  specifications: VendorEquipmentSpecifications;
}

interface VendorEquipmentsResponse {
  data: VendorEquipment[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface VendorEquipmentCreateRequest {
  name: string;
  category: string;
  serial_number?: string;
  model?: string;
  brand?: string;
  manufacture_date?: string;
  description?: string;
  specifications?: VendorEquipmentSpecifications;
  status?:
    | "active"
    | "inactive"
    | "maintenance"
    | "decommissioned"
    | "pending_installation";
}

export interface VendorEquipmentsParams {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  search?: string;
}

// Get vendor equipments with pagination
export const getVendorEquipments = async (
  vendorId: string,
  params: VendorEquipmentsParams = {},
): Promise<VendorEquipmentsResponse> => {
  const response = await axios.get(`/vendors/${vendorId}/equipments`, {
    params,
  });
  return response.data;
};

// Get single vendor equipment
export const getVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
): Promise<VendorEquipment> => {
  const response = await axios.get(
    `/vendors/${vendorId}/equipments/${equipmentId}`,
  );
  return response.data?.data ?? response.data;
};

// Create vendor equipment
export const createVendorEquipment = async (
  vendorId: string,
  data: VendorEquipmentCreateRequest,
): Promise<VendorEquipment> => {
  const response = await axios.post(`/vendors/${vendorId}/equipments`, data);
  return response.data?.data ?? response.data;
};

// Update vendor equipment
export const updateVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
  data: VendorEquipmentCreateRequest,
): Promise<VendorEquipment> => {
  const response = await axios.patch(
    `/vendors/${vendorId}/equipments/${equipmentId}`,
    data,
  );
  return response.data?.data ?? response.data;
};

// Delete vendor equipment
export const deleteVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
): Promise<void> => {
  await axios.delete(`/vendors/${vendorId}/equipments/${equipmentId}`);
};
