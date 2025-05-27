import { requestPatientConsent } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function usePatientConsent() {
  const { mutate: requestPatientConsentOtp, isPending: isRegistering } =
    useMutation({
      mutationFn: requestPatientConsent,
    });
  return { isRegistering, requestPatientConsentOtp };
}
