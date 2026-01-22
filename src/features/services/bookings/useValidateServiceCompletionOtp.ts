import { useMutation } from "@tanstack/react-query";
import {
  verifyServiceCompletionOtp,
  type VerifyServiceCompletionPayload,
} from "@/services/apiBooking";

export const useValidateServiceCompletionOtp = () => {
  const mutation = useMutation({
    mutationFn: (data: VerifyServiceCompletionPayload) =>
      verifyServiceCompletionOtp(data),
  });

  return {
    validateOtp: mutation.mutate,
    isValidating: mutation.isPending,
    error: mutation.error,
  };
};
