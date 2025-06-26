import { requestServiceCompletionOtp } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useServiceCompletionOtp() {
  const { mutate: requestOtp, isPending: isRequesting } = useMutation({
    mutationFn: requestServiceCompletionOtp,
    // Let the component handle success/error responses
  });

  return { requestOtp, isRequesting };
}
