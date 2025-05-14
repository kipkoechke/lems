export interface ServiceCategory {
  categoryId: string;
  name: string;
  vendorId: string;
  vendorName: string;
  vendorContact: string;
  equipmentId: string;
  equipmentName: string;
}

export interface ServiceCategoryForm {
  name: string;
  vendorId: string;
  vendorName: string;
  vendorContact: string;
  equipmentId: string;
  equipmentName: string;
}

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceCategory`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service categories");
  }

  return response.json();
};

export const getServiceCategoryById = async (
  categoryId: string
): Promise<ServiceCategory> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceCategory/${categoryId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service category");
  }

  return response.json();
};

export const createServiceCategory = async (
  data: ServiceCategoryForm
): Promise<ServiceCategory> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceCategory`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create service category");
  }

  return response.json();
};
