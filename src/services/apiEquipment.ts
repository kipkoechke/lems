import axios from "../lib/axios";
import type { Vendor } from "./apiVendors";

// Primary Equipment interface aligned with /api/v1/equipments
export interface Equipment {
  id: string;
  name: string;
  description?: string | null;
  serial_number: string;
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
  serialNumber: string;
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
  serial_number: string;
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
  serviceId: string
): Promise<EquipmentWithService[]> => {
  const response = await axios.get(`/service/equipments/${serviceId}`);
  return response.data.data;
};

export const getEquipmentByCategory = async (
  id: string
): Promise<Equipment[]> => {
  const response = await axios.get(`/Equipment/category/${id}`);
  return response.data.data;
};

export const getEquipmentByFacility = async (
  id: string
): Promise<Equipment[]> => {
  const response = await axios.get(`/Equipment/facility/${id}`);
  return response.data.data;
};

// CRUD aligned with /api/v1/equipments
export const createEquipment = async (
  data: EquipmentCreateRequest
): Promise<Equipment> => {
  const response = await axios.post("/equipments", data);
  return (response.data?.data ?? response.data) as Equipment;
};

export const updateEquipment = async (
  data: EquipmentUpdateRequest
): Promise<Equipment> => {
  const response = await axios.put(`/equipments/${data.id}`, data);
  return (response.data?.data ?? response.data) as Equipment;
};

export const deleteEquipment = async (id: string): Promise<void> => {
  await axios.delete(`/equipments/${id}`);
};
