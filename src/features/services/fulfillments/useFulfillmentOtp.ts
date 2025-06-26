import { requestServiceFulfillmentOtp } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useFulfillmentOtp() {
  const { mutate: requestFulfillmentOtp, isPending: isRequesting } =
    useMutation({
      mutationFn: (booking_number: string) =>
        requestServiceFulfillmentOtp(booking_number),
    });
  return { isRequesting, requestFulfillmentOtp };
}
