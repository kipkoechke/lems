import { useWorkflow } from "@/context/WorkflowContext";
import { patientConsent, PatientConsent } from "@/services/apiBooking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function usePatientConsent() {
  const { dispatch, goToNextStep } = useWorkflow();
  const queryClient = useQueryClient();

  const { mutate: registerPatientConsent, isPending: isRegistering } =
    useMutation({
      mutationFn: patientConsent,
      onSuccess: (data: PatientConsent) => {
        toast.success("Patient consent registered successfully!", {
          id: "registerPatientConsent",
        });
        queryClient.invalidateQueries({ queryKey: ["patients"] });
        dispatch({ type: "SET_CONSENT", payload: !!data });
        goToNextStep();
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong", {
          id: "registerPatientConsent",
        });
      },
    });
  return { isRegistering, registerPatientConsent };
}
