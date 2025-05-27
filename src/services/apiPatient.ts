import axios from "../lib/axios";

export interface Patient {
  patientId: string;
  patientName: string;
  mobileNumber: string;
  dateOfBirth: string;
  paymentMode: "Cash" | "SHA" | "Insurance";
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

export const getPatientById = async (patientID: string): Promise<Patient> => {
  const response = await axios.get(`/patient/${patientID}`);
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
