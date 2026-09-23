import { useMutation } from "@tanstack/react-query";
import {
  resendServiceCompletionOtp,
  type ResendServiceCompletionPayload,
} from "@/services/apiBooking";

export const useResendServiceCompletionOtp = () => {
  const mutation = useMutation({
    mutationFn: (data: ResendServiceCompletionPayload) =>
      resendServiceCompletionOtp(data),
  });

  return {
    resendOtp: mutation.mutate,
    isResending: mutation.isPending,
    error: mutation.error,
  };
};
