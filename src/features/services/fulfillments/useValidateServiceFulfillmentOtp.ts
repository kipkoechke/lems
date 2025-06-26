import { completeService } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import {
  ValidateOtp,
  ValidateOtpResponse,
  validateServiceFulfillmentOtp,
} from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useValidateServiceFulfillmentOtp() {
  const dispatch = useAppDispatch();

  const { mutate: validateOtpMutation, isPending: isValidating } = useMutation({
    mutationFn: ({ data }: { data: ValidateOtp }) =>
      validateServiceFulfillmentOtp(data),
    onSuccess: (data: ValidateOtpResponse) => {
      console.log("=== SERVICE FULFILLMENT OTP VALIDATION RESPONSE ===");
      console.log("Full response:", data);
      console.log("Response keys:", Object.keys(data));
      console.log("Message:", data.message);
      console.log("Success field (if exists):", (data as any).success);
      console.log("Status field (if exists):", (data as any).status);

      // Check for various success indicators
      const isSuccess =
        data.message === "Service fulfilled successfully" ||
        data.message === "Service completed successfully" ||
        data.message === "OTP verified successfully" ||
        data.message?.toLowerCase().includes("success") ||
        (data as any).success === true ||
        (data as any).status === "success";

      if (isSuccess) {
        toast.success("Service fulfilled successfully!");
        dispatch(completeService(true));
        // dispatch(goToNextStep());
      } else {
        console.log("Success condition not met. Response:", data);
        toast.error("Service not fulfilled. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "OTP validation failed");
    },
  });

  return { validateOtpMutation, isValidating };
}
