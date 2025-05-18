import axios from "../lib/axios";

export interface Facility {
  facilityId: string;
  facilityName: string;
  facilityCode: string;
  county: string;
  mobileNumber: string;
}

export type FacilityForm = Omit<Facility, "facilityId">;

export const getFacilities = async (): Promise<Facility[]> => {
  const response = await axios.get<Facility[]>("/Facility");
  return response.data;
};

export const getFacilityById = async (
  facilityId: string
): Promise<Facility> => {
  const response = await axios.get<Facility>(`/Facility/${facilityId}`);
  return response.data;
};

export const createFacility = async (data: FacilityForm): Promise<Facility> => {
  const response = await axios.post<Facility>("/Facility", data);
  return response.data;
};

export const updateFacility = async (
  facilityId: string,
  data: Partial<Facility>
): Promise<Facility> => {
  const response = await axios.patch<Facility>(`/Facility/${facilityId}`, data);
  return response.data;
};

export const deleteFacility = async (facilityId: string): Promise<void> => {
  await axios.delete<void>(`/Facility/${facilityId}`);
};
