import { useMutation } from "@tanstack/react-query";
import {
  requestServiceCompletionOtp,
  type ServiceCompletionPayload,
} from "@/services/apiBooking";

export const useServiceCompletionOtp = () => {
  const mutation = useMutation({
    mutationFn: (data: ServiceCompletionPayload) =>
      requestServiceCompletionOtp(data),
  });

  return {
    requestOtp: mutation.mutate,
    isRequesting: mutation.isPending,
    error: mutation.error,
  };
};
