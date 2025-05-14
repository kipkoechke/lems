export interface Equipment {
  equipmentId: string;
  equipmentName: string;
  categoryId: string;
  facilityId: string;
  serialNumber: string;
  installationDate: Date;
  lastMaintenanceDate: Date;
}
export interface EquipmentForm {
  equipmentName: string;
  categoryId: string;
  facilityId: string;
  serialNumber: string;
  installationDate: string;
  lastMaintenanceDate: string;
}

export const getEquipments = async (): Promise<Equipment[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Equipment`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  return response.json();
};

export const getEquipmentById = async (
  equipmentId: string
): Promise<Equipment> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Equipment/${equipmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  return response.json();
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
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Equipment/facility/${facilityId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch equipment by facility");
  }
  return response.json();
};

export const createEquipment = async (
  data: EquipmentForm
): Promise<Equipment> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Equipment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create equipment");
  }

  return response.json();
};
