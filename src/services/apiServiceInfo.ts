export interface ServiceInfo {
  serviceId: string;
  description: string;
  shaRate: number;
  vendorShare: number;
  facilityShare: number;
  categoryId: string;
}

export interface ServiceInfoForm {
  description: string;
  shaRate: number;
  vendorShare: number;
  facilityShare: number;
  categoryId: string;
}

export const getServiceInfo = async (): Promise<ServiceInfo[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceInfo`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service info");
  }

  const data = await response.json(); // Parse the JSON response
  console.log("Service Info Response:", data); // Log the parsed data

  return data; // Return the parsed data
};

export const getServiceInfoById = async (
  serviceId: string
): Promise<ServiceInfo> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceInfo/${serviceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service info");
  }

  return response.json();
};

export const createServiceInfo = async (
  data: ServiceInfoForm
): Promise<ServiceInfo> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceInfo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create service info");
  }

  return response.json();
};
