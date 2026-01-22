import {
  requestServiceCompletionOtp,
  type ServiceCompletionPayload,
} from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useFulfillmentOtp() {
  const { mutate: requestFulfillmentOtp, isPending: isRequesting } =
    useMutation({
      mutationFn: (data: ServiceCompletionPayload) =>
        requestServiceCompletionOtp(data),
    });
  return { isRequesting, requestFulfillmentOtp };
}
