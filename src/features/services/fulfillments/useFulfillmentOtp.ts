import { requestServiceFulfillmentOtp } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useFulfillmentOtp() {
  const { mutate: requestFulfillmentOtp, isPending: isRequesting } =
    useMutation({
      mutationFn: (bookingId: string) =>
        requestServiceFulfillmentOtp(bookingId),
    });
  return { isRequesting, requestFulfillmentOtp };
}
