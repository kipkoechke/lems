import { verifyServiceCompletionOtp } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useVerifyServiceCompletionOtp() {
  const { mutate: verifyOtp, isPending: isVerifying } = useMutation({
    mutationFn: verifyServiceCompletionOtp,
    // Let the component handle success/error responses
  });

  return { verifyOtp, isVerifying };
}
