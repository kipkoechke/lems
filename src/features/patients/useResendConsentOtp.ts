import { useMutation } from "@tanstack/react-query";
import { resendBookingOtp, type ResendOtpPayload } from "@/services/apiBooking";
import toast from "react-hot-toast";

export function useResendConsentOtp() {
  const { mutate: resendOtpMutation, isPending: isResending } = useMutation({
    mutationFn: (data: ResendOtpPayload) => resendBookingOtp(data),
    onSuccess: () => {
      toast.success("OTP resent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend OTP");
    },
  });

  return { resendOtpMutation, isResending };
}
