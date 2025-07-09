import axios from "../lib/axios";
import { Bookings } from "./apiBooking";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  date_of_birth: string;
  sha_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type PatientRegistrationForm = {
  name: string;
  phone: string;
  date_of_birth: string;
  sha_number?: string;
};

// Pagination link interface
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Paginated response interface for patients
export interface PaginatedPatientResponse {
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
  const response = await axios.post("/patient/upsert", data);
  return response.data;
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
  const response = await axios.get(`/patient/bookings/${id}`);
  return response.data.data;
};

export const getPatientById = async (id: string): Promise<Patient> => {
  const response = await axios.get(`/patient/${id}`);
  return response.data.data;
};

export const updatePatient = async (
  id: string,
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await axios.patch(`/Patient/${id}`, data);
  return response.data.data;
};

export const deletePatient = async (id: string): Promise<void> => {
  await axios.delete<void>(`/Patient/${id}`);
};
