import { useMutation } from "@tanstack/react-query";
import { checkEligibility, EligibilityRequest, EligibilityResponse } from "@/services/apiEligibility";
import toast from "react-hot-toast";

export function useEligibilityCheck() {
  const {
    mutate: checkSHAEligibility,
    isPending: isCheckingEligibility,
    data: eligibilityResult,
    error,
  } = useMutation<EligibilityResponse, Error, EligibilityRequest>({
    mutationFn: checkEligibility,
    onSuccess: (data) => {
      if (data.eligible === 1) {
        toast.success("Patient is eligible for SHA coverage");
      } else {
        toast.error(`Not eligible: ${data.reason}`);
      }
    },
    onError: (error) => {
      toast.error(`Eligibility check failed: ${error.message}`);
    },
  });

  return {
    checkSHAEligibility,
    isCheckingEligibility,
    eligibilityResult,
    error,
  };
}
