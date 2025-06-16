import axios from "../lib/axios";
import { Facility } from "./apiFacility";
import { Patient } from "./apiPatient";
import { PaymentMode } from "./apiPaymentMode";

export type ServiceBookingForm = {
  patient_id: string;
  service_id: string;
  equipment_id?: string;
  facility_id: string;
  payment_mode_id: string;
  booking_date: Date;
  cost: string;
  notes?: string;
  otp_overriden?: boolean;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  service_completion?: "pending" | "completed";
  approval?: "pending" | "approved" | "rejected";
};

export interface PatientConsent {
  booking_id: string;
}

export interface Bookings {
  bookingId: string;
  cost: string;
  bookingDate: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  serviceCompletion: "pending" | "completed";
  approval: "pending" | "approved" | "rejected";
  notes: string | null;
  otpOverridden: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  patient: Patient;
  facility: Facility & {
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
  // equipment: {
  //   equipmentId: string;
  //   equipmentName: string;
  //   serialNumber: string;
  //   status: string;
  //   createdAt: string;
  //   updatedAt: string;
  //   deleteddAt: string | null;
  //   category: {
  //     vendorId: string;
  //     vendorName: string;
  //     vendorCode: string;
  //     contactInfo: string;
  //     createdAt: string;
  //     updatedAt: string;
  //     deleteddAt: string | null;
  //   };
  //   serviceIds: string;
  // };
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

export interface BookingFilters {
  vendor_id?: string;
  facility_id?: string;
  category_id?: string;
  county_id?: string;
  sub_county_id?: string;
  service_completion?: string;
  approval?: string;
  start_date?: string; // "YYYY-MM-DD HH:mm:ss"
  end_date?: string; // "YYYY-MM-DD HH:mm:ss"
}

export const createServiceBooking = async (
  data: ServiceBookingForm
): Promise<Bookings> => {
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

export const requestServiceFulfillmentOtp = async (
  bookingId: string
): Promise<RequestConsentResponse> => {
  const response = await axios.post(
    `/initiate-service-completion/${bookingId}`
  );
  return response.data;
};

export const validateServiceFulfillmentOtp = async (
  data: ValidateOtp
): Promise<ValidateOtpResponse> => {
  const response = await axios.put(
    `/service-completion/${data.booking_id}`,
    data
  );
  return response.data;
};

export const getServiceBookingPatient = async (
  patientId: string
): Promise<Bookings[]> => {
  const response = await axios.get(`/ServiceBooking/patient/${patientId}`);
  return response.data.data;
};

export const getBookings = async (
  filters: BookingFilters = {}
): Promise<Bookings[]> => {
  const response = await axios.get("/bookings", { params: filters });
  return response.data.data;
};

export const approveBooking = async (bookingId: string): Promise<Bookings> => {
  const response = await axios.put(`/approve-booking/${bookingId}`);
  return response.data.data;
};

export const rejectBooking = async (bookingId: string): Promise<Bookings> => {
  const response = await axios.put(`/reject-booking/${bookingId}`);
  return response.data.data;
};

export const getServiceBookingFacility = async (
  facilityId: string
): Promise<Bookings[]> => {
  const response = await axios.get(`/ServiceBooking/facility/${facilityId}`);
  return response.data.data;
};

export const getServiceBookingById = async (
  bookingId: string
): Promise<Bookings> => {
  const response = await axios.get(`/ServiceBooking/${bookingId}`);
  return response.data.data;
};
