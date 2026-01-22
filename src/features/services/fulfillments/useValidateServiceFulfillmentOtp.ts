import { completeService } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import {
  verifyServiceCompletionOtp,
  type VerifyServiceCompletionPayload,
  type VerifyOtpResponse,
} from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useValidateServiceFulfillmentOtp() {
  const dispatch = useAppDispatch();

  const { mutate: validateOtpMutation, isPending: isValidating } = useMutation({
    mutationFn: ({ data }: { data: VerifyServiceCompletionPayload }) =>
      verifyServiceCompletionOtp(data),
    onSuccess: (data: VerifyOtpResponse) => {
      console.log("=== SERVICE FULFILLMENT OTP VALIDATION RESPONSE ===");
      console.log("Full response:", data);

      // Check for success
      const isSuccess =
        data.message?.toLowerCase().includes("success") ||
        data.message?.toLowerCase().includes("verified") ||
        data.message?.toLowerCase().includes("completed");

      if (isSuccess) {
        toast.success("Service fulfilled successfully!");
        dispatch(completeService(true));
      } else {
        console.log("Success condition not met. Response:", data);
        toast.error("Service not fulfilled. Please try again.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "OTP validation failed");
    },
  });

  return { validateOtpMutation, isValidating };
}
