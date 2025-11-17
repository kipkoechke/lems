import { useMutation } from "@tanstack/react-query";
import { requestServiceFulfillmentOtp } from "@/services/apiBooking";

export const useServiceCompletionOtp = () => {
  const mutation = useMutation({
    mutationFn: (booking_number: string) =>
      requestServiceFulfillmentOtp(booking_number),
  });

  return {
    requestOtp: mutation.mutate,
    isRequesting: mutation.isPending,
    error: mutation.error,
  };
};
