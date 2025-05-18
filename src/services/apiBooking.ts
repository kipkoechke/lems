import axios from "../lib/axios";

export interface IServiceBooking {
  bookingId: string;
  patientId: string;
  serviceId: string;
  equipmentId: string;
  facilityId: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
  cost: number;
}

export type ServiceBookingForm = Omit<IServiceBooking, "bookingId">;

export interface PatientConsent {
  bookingId: string;
  patientId: string;
  otpCode: string;
  consent: boolean;
}

export const createServiceBooking = async (
  data: ServiceBookingForm
): Promise<IServiceBooking> => {
  const response = await axios.post<IServiceBooking>("/ServiceBooking", data);
  return response.data;
};

export const patientConsent = async (
  data: PatientConsent
): Promise<PatientConsent> => {
  const response = await axios.post<PatientConsent>(
    "/ServiceBooking/patient-consent",
    data
  );
  return response.data;
};

export const getServiceBookingPatient = async (
  patientId: string
): Promise<IServiceBooking[]> => {
  const response = await axios.get<IServiceBooking[]>(
    `/ServiceBooking/patient/${patientId}`
  );
  return response.data;
};

export const getServiceBookingFacility = async (
  facilityId: string
): Promise<IServiceBooking[]> => {
  const response = await axios.get<IServiceBooking[]>(
    `/ServiceBooking/facility/${facilityId}`
  );
  return response.data;
};

export const getServiceBookingById = async (
  bookingId: string
): Promise<IServiceBooking> => {
  const response = await axios.get<IServiceBooking>(
    `/ServiceBooking/${bookingId}`
  );
  return response.data;
};
