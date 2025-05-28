import axios from "../lib/axios";
export interface Equipment {
  equipmentId: string;
  equipmentName: string;
  categoryId: string;
  facilityId: string;
  serialNumber: string;
  installationDate: Date;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMaintenanceDate: Date;
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

export const getEquipmentByCategory = async (
  categoryId: string
): Promise<Equipment[]> => {
  const response = await axios.get(`/Equipment/category/${categoryId}`);
  return response.data.data;
};

export const getEquipmentByFacility = async (
  facilityId: string
): Promise<Equipment[]> => {
  const response = await axios.get(`/Equipment/facility/${facilityId}`);
  return response.data.data;
};

export const createEquipment = async (
  data: EquipmentForm
): Promise<Equipment> => {
  const response = await axios.post("/Equipment", data);
  return response.data.data;
};
