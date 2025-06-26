import axios from "../lib/axios";
export interface Equipment {
  equipmentId: string;
  equipmentName: string;
  id: string;
  id: string;
  serialNumber: string;
  installationDate: Date;
  status: string;
  created_at: string;
  updatedAt: string;
  lastMaintenanceDate: Date;
}

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

export type EquipmentForm = Omit<Equipment, "equipmentId">;

export const getEquipments = async (): Promise<Equipment[]> => {
  const response = await axios.get("/equipments");
  return response.data.data;
};

export const getEquipmentById = async (
  equipmentId: string
): Promise<Equipment> => {
  const response = await axios.get(`/equipment/${equipmentId}`);
  return response.data.data;
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

export const createEquipment = async (
  data: EquipmentForm
): Promise<Equipment> => {
  const response = await axios.post("/Equipment", data);
  return response.data.data;
};
