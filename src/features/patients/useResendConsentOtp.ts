import { useMutation } from "@tanstack/react-query";
import { resendConsentOtp } from "@/services/apiBooking";

export function useResendConsentOtp() {
  const { mutate: resendOtpMutation, isPending: isResending } = useMutation({
    mutationFn: resendConsentOtp,
  });

  return { resendOtpMutation, isResending };
}
