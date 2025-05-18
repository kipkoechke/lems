import axios from "../lib/axios";

export interface Patient {
  patientId: string;
  patientName: string;
  mobileNumber: string;
  dateOfBirth: string;
  paymentMode: "Cash" | "SHA" | "Insurance";
}

export type PatientRegistrationForm = Omit<Patient, "patientId">;

export const registerPatient = async (
  data: PatientRegistrationForm
): Promise<Patient> => {
  const response = await axios.post<Patient>("/Patient", data);
  return response.data;
};

export const getRegisteredPatients = async (): Promise<Patient[]> => {
  const response = await axios.get<Patient[]>("/Patient");
  return response.data;
};

export const getPatientById = async (patientID: string): Promise<Patient> => {
  const response = await axios.get<Patient>(`/Patient/${patientID}`);
  return response.data;
};

export const updatePatient = async (
  patientID: string,
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await axios.patch<Patient>(`/Patient/${patientID}`, data);
  return response.data;
};

export const deletePatient = async (patientID: string): Promise<void> => {
  await axios.delete<void>(`/Patient/${patientID}`);
};
