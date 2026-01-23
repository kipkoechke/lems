import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  requestServiceCompletion,
  verifyCompletionOtp,
  resendCompletionOtp,
  VerifyCompletionOtpPayload,
  ResendCompletionOtpPayload,
} from "@/services/apiBooking";

// Request completion OTP
export function useRequestCompletion() {
  const { mutate: requestCompletion, isPending: isRequesting } = useMutation({
    mutationFn: ({
      bookingId,
      serviceId,
    }: {
      bookingId: string;
      serviceId: string;
    }) => requestServiceCompletion(bookingId, serviceId),
    onSuccess: (data) => {
      toast.success(data.message || "Completion OTP sent to patient");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to send completion OTP"
      );
    },
  });

  return { requestCompletion, isRequesting };
}

// Verify completion OTP
export function useVerifyCompletion() {
  const queryClient = useQueryClient();

  const { mutate: verifyCompletion, isPending: isVerifying } = useMutation({
    mutationFn: ({
      bookingId,
      serviceId,
      data,
    }: {
      bookingId: string;
      serviceId: string;
      data: VerifyCompletionOtpPayload;
    }) => verifyCompletionOtp(bookingId, serviceId, data),
    onSuccess: (data) => {
      toast.success(data.message || "Service completed successfully");
      // Invalidate worklist queries
      queryClient.invalidateQueries({ queryKey: ["practitioner-worklist"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to verify completion OTP"
      );
    },
  });

  return { verifyCompletion, isVerifying };
}

// Resend completion OTP
export function useResendCompletion() {
  const { mutate: resendCompletion, isPending: isResending } = useMutation({
    mutationFn: ({
      bookingId,
      serviceId,
      data,
    }: {
      bookingId: string;
      serviceId: string;
      data: ResendCompletionOtpPayload;
    }) => resendCompletionOtp(bookingId, serviceId, data),
    onSuccess: (data) => {
      toast.success(data.message || "Completion OTP resent successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to resend completion OTP"
      );
    },
  });

  return { resendCompletion, isResending };
}
