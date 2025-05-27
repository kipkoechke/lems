import { setPatient } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import { Patient, registerPatient } from "@/services/apiPatient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useRegisterPatient() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const { mutate: registerPatients, isPending: isRegistering } = useMutation({
    mutationFn: registerPatient,
    onSuccess: (data: Patient, _variables, context: any) => {
      toast.success("Patient registered successfully!", {
        id: "registerPatient",
      });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      dispatch(setPatient(data));
      // Only call custom onSuccess if provided
      if (context && typeof context.onSuccess === "function") {
        context.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong", {
        id: "registerPatient",
      });
    },
  });

  return { isRegistering, registerPatients };
}
