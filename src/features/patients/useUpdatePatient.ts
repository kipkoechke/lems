import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/apiError";
import toast from "react-hot-toast";
import { updatePatient, PatientUpdateRequest } from "@/services/apiPatient";

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: PatientUpdateRequest) => updatePatient(data),
    onSuccess: (_updatedPatient, variables) => {
      toast.success("Patient updated successfully");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
    },
    onError: (error: any) => {
      toast.error(apiErrorMessage(error, "Failed to update patient"));
    },
  });

  return {
    updatePatient: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
