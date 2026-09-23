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
  Booking,
  BookingFilters,
} from "@/types/booking";

export type Bookings = Booking;

// ===== Booking API Functions =====

// Initiate a booking (sends OTP)
export const initiateBooking = async (
  data: InitiateBookingPayload,
): Promise<InitiateBookingResponse> => {
  const response = await axios.post<InitiateBookingResponse>(
    "/bookings/initiate",
    data,
  );
  return response.data;
};

// Verify OTP and create booking
export const verifyBookingOtp = async (
  data: VerifyOtpPayload,
): Promise<VerifyOtpResponse> => {
  const response = await axios.post<VerifyOtpResponse>(
    "/bookings/verify-otp",
    data,
  );
  return response.data;
};

// Resend OTP
export const resendBookingOtp = async (
  data: ResendOtpPayload,
): Promise<ResendOtpResponse> => {
  const response = await axios.post<ResendOtpResponse>(
    "/bookings/resend-otp",
    data,
  );
  return response.data;
};

// Get single booking by ID
export const getBooking = async (id: string): Promise<Booking> => {
  const response = await axios.get<{ data: Booking }>(`/bookings/${id}`);
  return response.data.data;
};

// Get bookings list
export const getBookings = async (
  filters: BookingFilters = {},
): Promise<Booking[]> => {
  const response = await axios.get<BookingsResponse>("/bookings", {
    params: filters,
  });
  return response.data.data || [];
};

// Get bookings with pagination
export const getBookingsWithPagination = async (
  filters: BookingFilters = {},
): Promise<BookingsResponse> => {
  const response = await axios.get<BookingsResponse>("/bookings", {
    params: filters,
  });
  return response.data;
};

// ===== Service Completion =====
//
// The documented flow addresses the booking and service in the path:
//   POST /bookings/{booking}/services/{service}/request-completion
//   POST /bookings/{booking}/services/{service}/verify-completion
//   POST /bookings/{booking}/services/{service}/resend-completion

export interface ServiceCompletionPayload {
  booking_id: string;
  service_id: string;
}

interface ServiceCompletionOtpResponse {
  message: string;
  data: {
    session_id: string;
    service_id?: string;
    booking_id?: string;
    expires_at: string;
    expires_in_minutes?: number;
    phone_masked?: string;
    resends_remaining?: number;
  };
}

// POST /bookings/{booking}/services/{service}/request-completion — no body
export const requestServiceCompletionOtp = async ({
  booking_id,
  service_id,
}: ServiceCompletionPayload): Promise<ServiceCompletionOtpResponse> => {
  const response = await axios.post<ServiceCompletionOtpResponse>(
    `/bookings/${booking_id}/services/${service_id}/request-completion`,
  );
  return response.data;
};

export interface VerifyServiceCompletionPayload
  extends ServiceCompletionPayload {
  session_id: string;
  /** Exactly 6 characters. */
  otp: string;
}

// POST /bookings/{booking}/services/{service}/verify-completion
export const verifyServiceCompletionOtp = async ({
  booking_id,
  service_id,
  session_id,
  otp,
}: VerifyServiceCompletionPayload): Promise<VerifyOtpResponse> => {
  const response = await axios.post<VerifyOtpResponse>(
    `/bookings/${booking_id}/services/${service_id}/verify-completion`,
    { session_id, otp },
  );
  return response.data;
};

export interface ResendServiceCompletionPayload
  extends ServiceCompletionPayload {
  session_id: string;
}

// POST /bookings/{booking}/services/{service}/resend-completion
export const resendServiceCompletionOtp = async ({
  booking_id,
  service_id,
  session_id,
}: ResendServiceCompletionPayload): Promise<ServiceCompletionOtpResponse> => {
  const response = await axios.post<ServiceCompletionOtpResponse>(
    `/bookings/${booking_id}/services/${service_id}/resend-completion`,
    { session_id },
  );
  return response.data;
};

// ===== Finance Approval =====

export interface ServicePaymentBreakdown {
  booked_service_id: string;
  sha: number;
  cash: number;
  other_insurance: number;
}

export interface FinanceApprovalPayload {
  services: ServicePaymentBreakdown[];
}

interface FinanceApprovalResponse {
  message: string;
  data: Booking;
}

export const financeApproval = async (
  bookingId: string,
  data: FinanceApprovalPayload,
): Promise<FinanceApprovalResponse> => {
  const response = await axios.post<FinanceApprovalResponse>(
    `/bookings/${bookingId}/approve-finance`,
    data,
  );
  return response.data;
};

// ===== Booking Approval =====

export const approveBooking = async (bookingId: string): Promise<Booking> => {
  const response = await axios.post<{ data: Booking }>(
    `/bookings/${bookingId}/approve`,
  );
  return response.data.data;
};

export const rejectBooking = async (bookingId: string): Promise<Booking> => {
  const response = await axios.post<{ data: Booking }>(
    `/bookings/${bookingId}/reject`,
  );
  return response.data.data;
};
