import {
  initiateBooking,
  verifyBookingOtp,
  resendBookingOtp,
  type InitiateBookingPayload,
  type InitiateBookingResponse,
  type VerifyOtpPayload,
  type VerifyOtpResponse,
  type ResendOtpPayload,
} from "@/services/apiBooking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Hook for initiating a booking (sends OTP)
export function useInitiateBooking() {
  const { mutate: initiate, isPending: isInitiating } = useMutation({
    mutationFn: initiateBooking,
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate booking");
    },
  });

  return { initiate, isInitiating };
}

// Hook for verifying OTP and completing booking
export function useVerifyBookingOtp() {
  const queryClient = useQueryClient();

  const { mutate: verify, isPending: isVerifying } = useMutation({
    mutationFn: verifyBookingOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify OTP");
    },
  });

  return { verify, isVerifying };
}

// Hook for resending OTP
export function useResendBookingOtp() {
  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: resendBookingOtp,
    onSuccess: () => {
      toast.success("OTP resent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend OTP");
    },
  });

  return { resend, isResending };
}

// Legacy hook for backward compatibility
export function useCreateBooking() {
  const queryClient = useQueryClient();

  const { mutate: createBooking, isPending: isCreating } = useMutation({
    mutationFn: initiateBooking,
    onSuccess: (data: InitiateBookingResponse) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong", {
        id: "createBooking",
      });
    },
  });

  return { createBooking, isCreating };
}
