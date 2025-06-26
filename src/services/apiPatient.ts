import axios from "../lib/axios";
import { Bookings } from "./apiBooking";

export interface Patient {
  id: string;
  name: string;
  phone: string;
  date_of_birth: string;
  created_at: string;
}

export type PatientRegistrationForm = {
  name: string;
  phone: string;
  date_of_birth: string;
};

export const registerPatient = async (
  data: PatientRegistrationForm
): Promise<Patient> => {
  const response = await axios.post("/patient/upsert", data);
  return response.data;
};

export const getRegisteredPatients = async (): Promise<Patient[]> => {
  const response = await axios.get("/patients");
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
