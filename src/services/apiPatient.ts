import axios from "../lib/axios";
import { Bookings } from "./apiBooking";

export interface Patient {
  id: string;
  name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  phone: string;
  email: string | null;
  date_of_birth: string;
  gender: string | null;
  citizenship: string | null;
  civil_status: string | null;
  identification_no: string | null;
  identification_type: string | null;
  sha_number: string | null;
  wallet_id: string | null;
  cr_no: string | null;
  hh_no: string | null;
  county_id: string | null;
  sub_county_id: string | null;
  ward_id: string | null;
  village_estate: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type PatientRegistrationForm = {
  identificationType: string;
  identificationNumber: string;
};

// Identification type options
export const IDENTIFICATION_TYPES = [
  "CR ID",
  "National ID",
  "Birth Certificate",
  "Temporary ID",
  "Alien ID",
  "Passport",
] as const;

export type IdentificationType = (typeof IDENTIFICATION_TYPES)[number];

// County interface
export interface County {
  id: string;
  name: string;
  code: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// SubCounty interface
export interface SubCounty {
  id: string;
  name: string;
  code: string;
  county_id: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Ward interface
export interface Ward {
  id: string;
  code: string;
  name: string;
  sub_county_id: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Patient creation response interface
export interface PatientCreateResponse {
  message: string;
  patient: Patient & {
    county?: County;
    sub_county?: SubCounty;
    ward?: Ward;
  };
}

// Pagination link interface
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// API Pagination structure (as returned by the backend)
export interface ApiPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

// Paginated response interface for patients (API format)
export interface PaginatedPatientResponse {
  data: Patient[];
  pagination: ApiPagination;
}

// Legacy Laravel pagination format (for compatibility)
export interface LegacyPaginatedPatientResponse {
  current_page: number;
  data: Patient[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Pagination parameters interface
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// Search parameters interface
export interface SearchParams {
  search?: string;
  name?: string;
  phone?: string;
  sha_number?: string;
}

// Combined query parameters
export interface PatientQueryParams extends PaginationParams, SearchParams {}

export const registerPatient = async (
  data: PatientRegistrationForm
): Promise<Patient> => {
  const response = await axios.post<PatientCreateResponse>("/patients", data);
  return response.data.patient;
};

export const getRegisteredPatients = async (
  params?: PatientQueryParams
): Promise<Patient[]> => {
  const response = await axios.get("/patients", { params });
  // If the response has pagination structure, return the data array
  if (
    response.data &&
    response.data.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }
  // Otherwise, assume the response is already an array
  return Array.isArray(response.data) ? response.data : [];
};

export const getRegisteredPatientsPaginated = async (
  params?: PatientQueryParams
): Promise<PaginatedPatientResponse> => {
  const response = await axios.get("/patients", { params });
  return response.data;
};

export const getPatientByBooking = async (id: string): Promise<Bookings[]> => {
  const response = await axios.get(`/patients/${id}/bookings`);
  return response.data.data;
};

export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await axios.get(`/patients/${id}`);
  return response.data;
};

export interface PatientUpdateRequest {
  id: string;
  data: Partial<Patient>;
}

export const updatePatient = async (
  request: PatientUpdateRequest
): Promise<Patient> => {
  const response = await axios.patch(`/patient/${request.id}`, request.data);
  return response.data.data;
};

export const deletePatient = async (id: string): Promise<void> => {
  await axios.delete<void>(`/Patient/${id}`);
};
