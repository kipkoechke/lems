import axios from "../lib/axios";
export interface Equipment {
  equipmentId: string;
  equipmentName: string;
  categoryId: string;
  facilityId: string;
  serialNumber: string;
  installationDate: Date;
  lastMaintenanceDate: Date;
}
export type EquipmentForm = Omit<Equipment, "equipmentId">;

export const getEquipments = async (): Promise<Equipment[]> => {
  const response = await axios.get<Equipment[]>("/Equipment");
  return response.data;
};

export const getEquipmentById = async (
  equipmentId: string
): Promise<Equipment> => {
  const response = await axios.get<Equipment>(`/Equipment/${equipmentId}`);
  return response.data;
};

export const getEquipmentByCategory = async (
  categoryId: string
): Promise<Equipment[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Equipment/category/${categoryId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch equipment by category");
  }
  return response.json();
};

export const getEquipmentByFacility = async (
  facilityId: string
): Promise<Equipment[]> => {
  const response = await axios.get<Equipment[]>(
    `/Equipment/facility/${facilityId}`
  );
  return response.data;
};

export const createEquipment = async (
  data: EquipmentForm
): Promise<Equipment> => {
  const response = await axios.post<Equipment>("/Equipment", data);
  return response.data;
};
