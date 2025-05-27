import { goToNextStep, setConsent } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import {
  ValidateOtpResponse,
  validateOverrideOtp,
} from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useOtpValidationOverride() {
  const dispatch = useAppDispatch();

  const { mutate: validateConsentOverrideOtp, isPending: isValidating } =
    useMutation({
      mutationFn: validateOverrideOtp,
      onSuccess: (data: ValidateOtpResponse) => {
        if (
          data.message ===
          "Override OTP validated and consent granted successfully"
        ) {
          toast.success("OTP validated and consent granted!");
          dispatch(setConsent(true));
          dispatch(goToNextStep());
        } else {
          toast.error("Consent not granted. Please try again.");
        }
      },
      onError: (error) => {
        toast.error(error.message || "OTP validation failed");
      },
    });

  return { validateConsentOverrideOtp, isValidating };
}
