import { useMutation } from "@tanstack/react-query";
import {
  validateServiceFulfillmentOtp,
  ValidateServiceCompletionOtp,
} from "@/services/apiBooking";

export const useValidateServiceCompletionOtp = () => {
  const mutation = useMutation({
    mutationFn: (data: ValidateServiceCompletionOtp) =>
      validateServiceFulfillmentOtp(data),
  });

  return {
    validateOtp: mutation.mutate,
    isValidating: mutation.isPending,
    error: mutation.error,
  };
};
