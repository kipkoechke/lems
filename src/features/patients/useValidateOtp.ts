import { setConsent } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import { verifyPatientConsent } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useOtpValidation() {
  const dispatch = useAppDispatch();

  const { mutate: validateOtpMutation, isPending: isValidating } = useMutation({
    mutationFn: verifyPatientConsent,
    // Remove all global handlers - let the component handle everything
  });

  // Helper function to set consent - called from component
  const setConsentApproved = () => {
    dispatch(setConsent(true));
  };

  return { validateOtpMutation, isValidating, setConsentApproved };
}
