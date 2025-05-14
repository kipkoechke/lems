export interface Facility {
  facilityId: string;
  facilityName: string;
  facilityCode: string;
  county: string;
  mobileNumber: string;
}

export interface FacilityForm {
  facilityName: string;
  facilityCode: string;
  county: string;
  mobileNumber: string;
}

export const getFacilities = async (): Promise<Facility[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Facility`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch facilities");
  }

  return response.json();
};

export const getFacilityById = async (
  facilityId: string
): Promise<Facility> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Facility/${facilityId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch facility");
  }

  return response.json();
};

export const createFacility = async (data: FacilityForm): Promise<Facility> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Facility`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create facility");
  }

  return response.json();
};

export const updateFacility = async (
  facilityId: string,
  data: FacilityForm
): Promise<Facility> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Facility/${facilityId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update facility");
  }

  return response.json();
};

export const deleteFacility = async (facilityId: string): Promise<void> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/Facility/${facilityId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete facility");
  }
};
