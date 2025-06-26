import axios from "../lib/axios";

export interface Facility {
  id: string;
  name: string;
  code: string;
  ward_id: string;
  sub_county_id: string;
  county_id: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  regulatory_status: string;
  facility_type: string;
  owner: string;
  operation_status: string;
  keph_level: string;
}

// Legacy interface for backward compatibility
export interface LegacyFacility {
  id: string;
  name: string;
  code: string;
  contactInfo: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Enums for better type safety
export enum RegulatoryStatus {
  PENDING_REGISTRATION = "Pending Registration",
  LICENSED = "Licensed",
  SUSPENDED = "Suspended",
  REVOKED = "Revoked",
}

export enum FacilityType {
  DISPENSARY = "Dispensary",
  HEALTH_CENTER = "Health Center",
  HOSPITAL = "Hospital",
  CLINIC = "Clinic",
}

export enum Owner {
  MINISTRY_OF_HEALTH = "Ministry of Health",
  PRIVATE = "Private",
  FAITH_BASED = "Faith Based",
  NGO = "NGO",
}

export enum OperationStatus {
  OPERATIONAL = "Operational",
  NON_OPERATIONAL = "Non-Operational",
  TEMPORARILY_CLOSED = "Temporarily Closed",
}

export enum KephLevel {
  LEVEL_1 = "Level 1",
  LEVEL_2 = "Level 2",
  LEVEL_3 = "Level 3",
  LEVEL_4 = "Level 4",
  LEVEL_5 = "Level 5",
  LEVEL_6 = "Level 6",
}

export interface EditFacilityForm {
  name: string;
  code: string;
  ward_id: string;
  sub_county_id: string;
  county_id: string;
  is_active: string;
  regulatory_status: RegulatoryStatus | string;
  facility_type: FacilityType | string;
  owner: Owner | string;
  operation_status: OperationStatus | string;
  keph_level: KephLevel | string;
}

export interface CreateFacilityForm {
  name: string;
  code: string;
  ward_id: string;
  sub_county_id: string;
  county_id: string;
  is_active?: string;
  regulatory_status: RegulatoryStatus | string;
  facility_type: FacilityType | string;
  owner: Owner | string;
  operation_status: OperationStatus | string;
  keph_level: KephLevel | string;
}

// Legacy form interface for backward compatibility
export interface LegacyEditFacilityForm {
  name: string;
  code: string;
  contact_info: string;
}

// Legacy form interface for backward compatibility
export interface LegacyEditFacilityForm {
  name: string;
  code: string;
  contact_info: string;
}

// Utility types
export type FacilityForm = Omit<
  Facility,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;
export type LegacyFacilityForm = Omit<LegacyFacility, "id">;

// API Response types
export interface FacilityResponse {
  data: Facility[];
  message?: string;
  status?: string;
}

export interface SingleFacilityResponse {
  data: Facility;
  message?: string;
  status?: string;
}

// Filter types for API queries
export interface FacilityFilters {
  county_id?: string;
  sub_county_id?: string;
  ward_id?: string;
  facility_type?: FacilityType | string;
  operation_status?: OperationStatus | string;
  regulatory_status?: RegulatoryStatus | string;
  owner?: Owner | string;
  keph_level?: KephLevel | string;
  is_active?: string;
}

export const getFacilities = async (): Promise<Facility[]> => {
  const response = await axios.get("/facilities");
  return response.data;
};

export const getFacilityById = async (id: string): Promise<Facility> => {
  const response = await axios.get(`/facility/${id}`);
  return response.data.data;
};

export const createFacility = async (data: FacilityForm): Promise<Facility> => {
  const response = await axios.post("/create-facility", data);
  return response.data.data;
};

export const updateFacility = async (
  id: string,
  data: Partial<EditFacilityForm>
): Promise<EditFacilityForm> => {
  const response = await axios.put(`/update-facility/${id}`, data);
  return response.data.data;
};

export const deleteFacility = async (id: string): Promise<void> => {
  await axios.delete<void>(`/Facility/${id}`);
};
