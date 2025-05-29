import axios from "../lib/axios";

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

export interface PatientWithBookings {
  bookingId: string;
  cost: string;
  bookingDate: string;
  status: string;
  notes: string | null;
  otpOverridden: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  patient: {
    patientId: string;
    patientName: string;
    mobileNumber: string;
    dateOfBirth: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  facility: {
    facilityId: string;
    facilityName: string;
    facilityCode: string;
    contactInfo: string;
    createdAt: string;
    updatedAt: string;
    deleteddAt: string | null;
  };
  service: {
    serviceId: string;
    serviceName: string;
    description: string;
    shaRate: string;
    vendorShare: string;
    facilityShare: string;
    capitated: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    category: {
      categoryId: string;
      lotNumber: string;
      categoryName: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  };
  equipment: {
    equipmentId: string;
    equipmentName: string;
    serialNumber: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deleteddAt: string | null;
    category: {
      vendorId: string;
      vendorName: string;
      vendorCode: string;
      contactInfo: string;
      createdAt: string;
      updatedAt: string;
      deleteddAt: string | null;
    };
    serviceIds: string;
  };
  paymentMode: {
    paymentModeId: string;
    paymentModeName: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

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
): Promise<PatientWithBookings[]> => {
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
