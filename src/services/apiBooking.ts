import axios from "../lib/axios";
import { Equipment } from "./apiEquipment";
import { Facility } from "./apiFacility";
import { Patient } from "./apiPatient";
import { PaymentMode } from "./apiPaymentMode";

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
  cost: string;
}

export type ServiceBookingForm = {
  patient_id: string;
  service_id: string;
  equipment_id: string;
  facility_id: string;
  payment_mode_id: string;
  booking_date: Date;
  cost: string;
  notes?: string;
  otp_overriden?: boolean;
  status?: string;
};

export interface PatientConsent {
  booking_id: string;
}

export interface BookingWithDetails {
  bookingId: string;
  cost: string;
  bookingDate: string;
  status: string;
  notes: string | null;
  otpOverridden: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  patient: Patient;
  facility: Facility;
  service: any;
  equipment: Equipment;
  paymentMode: PaymentMode;
}

export interface ValidateOtp {
  booking_id: string;
  otp_code: string;
}

export interface RequestConsentResponse {
  message: string;
  otp_code: string;
  expires_at: string;
  bookingConsent: any;
}

export interface ValidateOtpResponse {
  message: string;
  bookingConsent: any;
}

export const createServiceBooking = async (
  data: ServiceBookingForm
): Promise<IServiceBooking> => {
  const response = await axios.post("/create-booking", data);
  return response.data.booking;
};

export const requestPatientConsent = async (
  data: PatientConsent
): Promise<RequestConsentResponse> => {
  const response = await axios.post("/request-consent", data);
  return response.data;
};

export const validateOtp = async (
  data: ValidateOtp
): Promise<ValidateOtpResponse> => {
  const response = await axios.put("/validate_otp", data);
  return response.data;
};

export const requestConsentOverride = async (
  data: PatientConsent
): Promise<RequestConsentResponse> => {
  const response = await axios.post("/request_override", data);
  return response.data;
};

export const validateOverrideOtp = async (
  data: ValidateOtp
): Promise<ValidateOtpResponse> => {
  const response = await axios.put("/validate_override", data);
  return response.data;
};

export const getServiceBookingPatient = async (
  patientId: string
): Promise<IServiceBooking[]> => {
  const response = await axios.get(`/ServiceBooking/patient/${patientId}`);
  return response.data.data;
};

export const getBookings = async (): Promise<BookingWithDetails[]> => {
  const response = await axios.get("/bookings");
  return response.data.data;
};

export const getServiceBookingFacility = async (
  facilityId: string
): Promise<IServiceBooking[]> => {
  const response = await axios.get(`/ServiceBooking/facility/${facilityId}`);
  return response.data.data;
};

export const getServiceBookingById = async (
  bookingId: string
): Promise<IServiceBooking> => {
  const response = await axios.get(`/ServiceBooking/${bookingId}`);
  return response.data.data;
};
