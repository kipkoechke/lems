import { useMutation } from "@tanstack/react-query";
import {
  checkEligibility,
  EligibilityRequest,
  EligibilityResponse,
} from "@/services/apiEligibility";
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
      if (data.eligible) {
        const coverageMsg = data.coverage_end_date
          ? ` Coverage valid until ${new Date(
              data.coverage_end_date
            ).toLocaleDateString()}`
          : "";
        toast.success(`${data.message}${coverageMsg}`);
      } else {
        toast.error(`Not eligible: ${data.message}`);
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
