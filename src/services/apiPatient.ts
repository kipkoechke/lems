import axios from "../lib/axios";
import { Bookings } from "./apiBooking";

export interface Patient {
  patientId: string;
  patientName: string;
  mobileNumber: string;
  dateOfBirth: string;
  createdAt: string;
}

export type PatientRegistrationForm = {
  name: string;
  phone: string;
  date_of_birth: string;
};

export const registerPatient = async (
  data: PatientRegistrationForm
): Promise<Patient> => {
  const response = await axios.post("/create-patient", data);
  return response.data.patient;
};

export const getRegisteredPatients = async (): Promise<Patient[]> => {
  const response = await axios.get("/patients");
  return response.data.data;
};

export const getPatientByBooking = async (
  patientId: string
): Promise<Bookings[]> => {
  const response = await axios.get(`/patient/bookings/${patientId}`);
  return response.data.data;
};

export const getPatientById = async (patientId: string): Promise<Patient> => {
  const response = await axios.get(`/patient/${patientId}`);
  return response.data.data;
};

export const updatePatient = async (
  patientID: string,
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await axios.patch(`/Patient/${patientID}`, data);
  return response.data.data;
};

export const deletePatient = async (patientID: string): Promise<void> => {
  await axios.delete<void>(`/Patient/${patientID}`);
};
