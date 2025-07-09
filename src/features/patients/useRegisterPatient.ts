import { goToNextStep, setPatient } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import { Patient, registerPatient } from "@/services/apiPatient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useRegisterPatient() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const { mutate: registerPatients, isPending: isRegistering } = useMutation({
    mutationFn: registerPatient,
    onSuccess: (data: Patient) => {
      // Always invalidate queries and update Redux
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      dispatch(setPatient(data));
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong", {
        id: "registerPatient",
      });
    },
  });

  return { isRegistering, registerPatients };
}
