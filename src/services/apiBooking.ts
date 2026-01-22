import axios from "../lib/axios";
import type {
  InitiateBookingPayload,
  InitiateBookingResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  Booking,
  BookingsResponse,
  BookingFilters,
} from "@/types/booking";

// Re-export types for backward compatibility
export type {
  InitiateBookingPayload,
  InitiateBookingResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  Booking,
  BookingsResponse,
  BookingFilters,
  BookingService,
  BookingPatient,
  BookingFacility,
  BookingPayment,
} from "@/types/booking";

// Legacy type alias for backward compatibility
export type ServiceBookingForm = InitiateBookingPayload;
export type Bookings = Booking;

// ===== Booking API Functions =====

// Initiate a booking (sends OTP)
export const initiateBooking = async (
  data: InitiateBookingPayload
): Promise<InitiateBookingResponse> => {
  const response = await axios.post<InitiateBookingResponse>(
    "/bookings/initiate",
    data
  );
  return response.data;
};

// Legacy alias
export const createServiceBooking = initiateBooking;

// Verify OTP and create booking
export const verifyBookingOtp = async (
  data: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  const response = await axios.post<VerifyOtpResponse>(
    "/bookings/verify-otp",
    data
  );
  return response.data;
};

// Resend OTP
export const resendBookingOtp = async (
  data: ResendOtpPayload
): Promise<ResendOtpResponse> => {
  const response = await axios.post<ResendOtpResponse>(
    "/bookings/resend-otp",
    data
  );
  return response.data;
};

// Get bookings list
export const getBookings = async (
  filters: BookingFilters = {}
): Promise<Booking[]> => {
  const response = await axios.get<BookingsResponse>("/bookings", {
    params: filters,
  });
  return response.data.data || [];
};

// Get bookings with pagination
export const getBookingsWithPagination = async (
  filters: BookingFilters = {}
): Promise<BookingsResponse> => {
  const response = await axios.get<BookingsResponse>("/bookings", {
    params: filters,
  });
  return response.data;
};

// Get single booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking> => {
  const response = await axios.get<{ data: Booking }>(`/bookings/${bookingId}`);
  return response.data.data;
};

// ===== Service Completion =====

export interface ServiceCompletionPayload {
  booking_id: string;
  service_id: string;
}

export interface ServiceCompletionOtpResponse {
  message: string;
  data: {
    session_id: string;
    phone: string;
    expires_at: string;
  };
}

// Request OTP for service completion
export const requestServiceCompletionOtp = async (
  data: ServiceCompletionPayload
): Promise<ServiceCompletionOtpResponse> => {
  const response = await axios.post<ServiceCompletionOtpResponse>(
    "/bookings/service/request-otp",
    data
  );
  return response.data;
};

export interface VerifyServiceCompletionPayload {
  session_id: string;
  otp: string;
}

// Verify OTP for service completion
export const verifyServiceCompletionOtp = async (
  data: VerifyServiceCompletionPayload
): Promise<VerifyOtpResponse> => {
  const response = await axios.post<VerifyOtpResponse>(
    "/bookings/service/verify-otp",
    data
  );
  return response.data;
};

// ===== Finance Approval =====

export interface FinanceApprovalPayload {
  payment_mode: string;
  status: "confirmed" | "cancelled";
}

export interface FinanceApprovalResponse {
  message: string;
  data: Booking;
}

export const financeApproval = async (
  bookingId: string,
  data: FinanceApprovalPayload
): Promise<FinanceApprovalResponse> => {
  const response = await axios.post<FinanceApprovalResponse>(
    `/bookings/${bookingId}/finance`,
    data
  );
  return response.data;
};

// ===== Booking Approval =====

export const approveBooking = async (bookingId: string): Promise<Booking> => {
  const response = await axios.post<{ data: Booking }>(
    `/bookings/${bookingId}/approve`
  );
  return response.data.data;
};

export const rejectBooking = async (bookingId: string): Promise<Booking> => {
  const response = await axios.post<{ data: Booking }>(
    `/bookings/${bookingId}/reject`
  );
  return response.data.data;
};
