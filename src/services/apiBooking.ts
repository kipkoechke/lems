import axios from "../lib/axios";
import { Facility } from "./apiFacility";
import { Patient } from "./apiPatient";

export type ServiceBookingForm = {
  patient_id: string;
  payment_mode: string;
  override: boolean;
  services: {
    service_id: string;
    booking_date: string;
  }[];
};

export interface PatientConsent {
  booking_id: string;
}

export interface BookingService {
  id: string;
  booking_id: string;
  vendor_facility_lot_service_pivot_id: string;
  service_completion_by: string | null;
  booking_date: string;
  vendor_share: string;
  facility_share: string;
  service_status: "not_started" | "completed";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  service: {
    id: string;
    ven_flty_lot_pivot_id: string;
    service_id: string;
    is_active: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    equipment_id: string;
    contract: {
      id: string;
      vendor_id: string;
      facility_id: string;
      lot_id: string;
      is_active: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      facility: Facility & {
        regulatory_status: string;
        facility_type: string;
        owner: string;
        operation_status: string;
        keph_level: string;
        ward: {
          id: string;
          code: string;
          name: string;
          sub_county_id: string;
          is_active: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        sub_county: {
          id: string;
          name: string;
          code: string;
          county_id: string;
          is_active: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
    };
    service: {
      id: string;
      name: string;
      code: string;
      sha_rate: string;
      facility_share: string;
      vendor_share: string;
      is_capitated: string;
      lot_id: string;
      is_active: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
  };
}

export interface Bookings {
  id: string;
  booking_number: string; // The actual booking number used for OTP verification
  patient_id: string;
  booking_status: "pending" | "confirmed" | "completed" | "cancelled";
  approval_status: "pending" | "approved" | "rejected";
  payment_mode: string;
  booked_by: string | null;
  approved_by: string | null;
  booking_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  override: string;
  otp_code?: string; // OTP code sent directly with booking creation
  patient: Patient;
  services: BookingService[];

  // Legacy fields for backward compatibility
  vendor_facility_lot_service_pivot_id?: string;
  amount?: string;
  facility_share?: string;
  vendor_share?: string;
  service_status?: "not_started" | "completed";
  service_completion_by?: string | null;
  service?: {
    id: string;
    ven_flty_lot_pivot_id: string;
    service_id: string;
    is_active: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    contract: {
      id: string;
      vendor_id: string;
      facility_id: string;
      lot_id: string;
      is_active: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      facility: Facility & {
        regulatory_status: string;
        facility_type: string;
        owner: string;
        operation_status: string;
        keph_level: string;
      };
    };
    service: {
      id: string;
      name: string;
      code: string;
      sha_rate: string;
      facility_share: string;
      vendor_share: string;
      is_capitated: string;
      lot_id: string;
      is_active: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
  };
}

export interface ValidateOtp {
  booking_number: string;
  otp_code: string;
}

export interface ValidateServiceCompletionOtp {
  booking_number: string;
  service_id: string;
  otp_code: string;
}

export interface ValidateConsentRequest {
  otp_code: string;
  booking_number: string;
}

export interface RequestConsentResponse {
  message: string;
  otp_code: string;
  expires_at: string;
  bookingConsent: any;
}

export interface ValidateOtpResponse {
  message: string;
  bookingConsent?: any;
  success?: boolean;
  status?: string;
  [key: string]: any; // Allow additional fields
}

export interface BookingsResponse {
  bookings: {
    current_page: number;
    data: Bookings[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface BookingFilters {
  vendor_id?: string;
  facility_id?: string;
  category_id?: string;
  county_id?: string;
  sub_county_id?: string;
  service_completion?: string;
  approval_status?: string; // Updated from 'approval' to 'approval_status'
  start_date?: string; // "YYYY-MM-DD HH:mm:ss"
  end_date?: string; // "YYYY-MM-DD HH:mm:ss"
  page?: number;
  per_page?: number;
}

export interface BookingCreationResponse {
  message: string;
  otp_message: string;
  otp_code: string;
  expires_at: string;
  booking: Bookings;
  services: {
    id: string;
    booking_id: string;
    vendor_facility_lot_service_pivot_id: string;
    service_completion_by: string | null;
    booking_date: string;
    vendor_share: string;
    facility_share: string;
    service_status: "not_started" | "completed";
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  }[];
}

export const createServiceBooking = async (
  data: ServiceBookingForm
): Promise<BookingCreationResponse> => {
  const response = await axios.post("/booking/create", data);
  return response.data;
};

export const validateOtp = async (
  data: ValidateOtp
): Promise<ValidateOtpResponse> => {
  const response = await axios.put("/validate_otp", data);
  return response.data;
};

export const verifyPatientConsent = async (
  data: ValidateConsentRequest
): Promise<ValidateOtpResponse> => {
  const response = await axios.post("/booking/verify/consent", data);
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
  booking_number: string
): Promise<RequestConsentResponse> => {
  const response = await axios.post(`/booking/serviceCompletion/request/OTP`, {
    booking_number,
  });
  return response.data;
};

export const validateServiceFulfillmentOtp = async (
  data: ValidateServiceCompletionOtp
): Promise<ValidateOtpResponse> => {
  const response = await axios.post(
    `/booking/serviceCompletion/verify/OTP`,
    data
  );
  return response.data;
};

export const getServiceBookingPatient = async (
  id: string
): Promise<Bookings[]> => {
  const response = await axios.get(`/ServiceBooking/patient/${id}`);
  return response.data.data;
};

export const getBookings = async (
  filters: BookingFilters = {}
): Promise<Bookings[]> => {
  const response = await axios.get<BookingsResponse>("/bookings", {
    params: filters,
  });
  return response.data.bookings.data;
};

export const getBookingsWithPagination = async (
  filters: BookingFilters = {}
): Promise<BookingsResponse> => {
  const response = await axios.get<BookingsResponse>("/bookings", {
    params: filters,
  });
  return response.data;
};

export const approveBooking = async (
  booking_number: string
): Promise<Bookings> => {
  const response = await axios.post("/booking/approval", {
    booking_number: booking_number,
    decision: "approve",
  });
  return response.data.booking;
};

export const rejectBooking = async (
  booking_number: string
): Promise<Bookings> => {
  const response = await axios.post("/booking/approval", {
    booking_number: booking_number,
    decision: "reject",
  });
  return response.data.booking;
};

export const getServiceBookingFacility = async (
  id: string
): Promise<Bookings[]> => {
  const response = await axios.get(`/ServiceBooking/facility/${id}`);
  return response.data.data;
};

export const getServiceBookingById = async (
  bookingId: string
): Promise<Bookings> => {
  const response = await axios.get(`/ServiceBooking/${bookingId}`);
  return response.data.data;
};
