import { setConsent } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import {
  ValidateOtpResponse,
  verifyPatientConsent,
} from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useOtpValidation() {
  const dispatch = useAppDispatch();

  const { mutate: validateOtpMutation, isPending: isValidating } = useMutation({
    mutationFn: verifyPatientConsent,
    onSuccess: (data: ValidateOtpResponse) => {
      // Only set consent in Redux, let the component handle toasts and navigation
      dispatch(setConsent(true));
    },
    // Remove automatic error handling, let the component handle it
  });

  return { validateOtpMutation, isValidating };
}
