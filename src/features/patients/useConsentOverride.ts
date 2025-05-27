import { requestConsentOverride } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function usePatientConsentOverride() {
  const { mutate: requestConsentOtpOverride, isPending: isRegistering } =
    useMutation({
      mutationFn: requestConsentOverride,
    });
  return { isRegistering, requestConsentOtpOverride };
}
