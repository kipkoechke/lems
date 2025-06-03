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
      if (data.message === "Service completed successfully") {
        toast.success("Service completed successfully!");
        dispatch(completeService(true));
        // dispatch(goToNextStep());
      } else {
        toast.error("Service not completed. Please try again.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "OTP validation failed");
    },
  });

  return { validateOtpMutation, isValidating };
}
