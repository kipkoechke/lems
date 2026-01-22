import axios from "../lib/axios";
import type { Vendor } from "./apiVendors";

// Primary Equipment interface aligned with /api/v1/equipments
export interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  serial_number?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  year?: number | string | null;
  status: string; // available | maintenance | unavailable | retired | ...
  vendor_id: string;
  vendor?: Vendor; // populated in some responses
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Legacy/auxiliary types kept for backward compatibility in other features
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

export interface EquipmentCreateRequest {
  name: string;
  status: string;
  vendor_id: string;
  serial_number?: string | null;
  description?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  year?: number | string | null;
}

export interface EquipmentUpdateRequest extends EquipmentCreateRequest {
  id: string;
}

export const getEquipments = async (): Promise<Equipment[]> => {
  const response = await axios.get("/equipments");
  const data = response.data;
  if (Array.isArray(data)) return data as Equipment[];
  if (Array.isArray(data?.data)) return data.data as Equipment[];
  if (Array.isArray(data?.equipments)) return data.equipments as Equipment[];
  return [];
};

export const getEquipmentById = async (id: string): Promise<Equipment> => {
  const response = await axios.get(`/equipments/${id}`);
  return (response.data?.data ?? response.data) as Equipment;
};

export const getEquipmentByService = async (
  serviceId: string,
): Promise<EquipmentWithService[]> => {
  const response = await axios.get(`/service/equipments/${serviceId}`);
  return response.data.data;
};

export const getEquipmentByCategory = async (
  id: string,
): Promise<Equipment[]> => {
  const response = await axios.get(`/Equipment/category/${id}`);
  return response.data.data;
};

export const getEquipmentByFacility = async (
  id: string,
): Promise<Equipment[]> => {
  const response = await axios.get(`/Equipment/facility/${id}`);
  return response.data.data;
};

// CRUD aligned with /api/v1/equipments
export const createEquipment = async (
  data: EquipmentCreateRequest,
): Promise<Equipment> => {
  const response = await axios.post("/equipments", data);
  return (response.data?.data ?? response.data) as Equipment;
};

export const updateEquipment = async (
  data: EquipmentUpdateRequest,
): Promise<Equipment> => {
  const response = await axios.put(`/equipments/${data.id}`, data);
  return (response.data?.data ?? response.data) as Equipment;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  await axios.delete(`/equipments/${id}`);
};

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

export interface VendorEquipmentsResponse {
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

export interface VendorEquipmentUpdateRequest extends VendorEquipmentCreateRequest {
  id: string;
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
