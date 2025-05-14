import { useWorkflow } from "@/context/WorkflowContext";

import { Patient, registerPatient } from "@/services/apiPatient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useRegisterPatient() {
  const { dispatch, goToNextStep } = useWorkflow();
  const queryClient = useQueryClient();

  const { mutate: registerPatients, isPending: isRegistering } = useMutation({
    mutationFn: registerPatient,
    onSuccess: (data: Patient) => {
      toast.success("Patient registered successfully!", {
        id: "registerPatient",
      });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      dispatch({ type: "SET_PATIENT", payload: data });
      goToNextStep();
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong", {
        id: "registerPatient",
      });
    },
  });

  return { isRegistering, registerPatients };
}
