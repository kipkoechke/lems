import { goToNextStep, setConsent } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import { validateOtp, ValidateOtpResponse } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useOtpValidation() {
  const dispatch = useAppDispatch();

  const { mutate: validateOtpMutation, isPending: isValidating } = useMutation({
    mutationFn: validateOtp,
    onSuccess: (data: ValidateOtpResponse) => {
      if (data.message === "OTP validated and consent granted successfully") {
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

  return { validateOtpMutation, isValidating };
}
