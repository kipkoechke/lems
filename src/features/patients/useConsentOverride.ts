// TODO: Update to use new API endpoint when available
// import { requestConsentOverride } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

// Placeholder function until API endpoint is available
const requestConsentOverride = async (_data: unknown) => {
  throw new Error("Consent override API not yet implemented");
};

export function usePatientConsentOverride() {
  const { mutate: requestConsentOtpOverride, isPending: isRegistering } =
    useMutation({
      mutationFn: requestConsentOverride,
    });
  return { isRegistering, requestConsentOtpOverride };
}
