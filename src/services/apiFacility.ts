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
  const response = await axios.get("/facilities");
  return response.data.data;
};

export const getFacilityById = async (
  facilityId: string
): Promise<Facility> => {
  const response = await axios.get(`/facility/${facilityId}`);
  return response.data.data;
};

export const createFacility = async (data: FacilityForm): Promise<Facility> => {
  const response = await axios.post("/create-facility", data);
  return response.data.data;
};

export const updateFacility = async (
  facilityId: string,
  data: Partial<Facility>
): Promise<Facility> => {
  const response = await axios.patch(`/update-facility/${facilityId}`, data);
  return response.data.data;
};

export const deleteFacility = async (facilityId: string): Promise<void> => {
  await axios.delete<void>(`/Facility/${facilityId}`);
};
