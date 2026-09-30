import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/apiError";
import toast from "react-hot-toast";
import { updateFacility, EditFacilityForm } from "@/services/apiFacility";

interface UpdateFacilityRequest {
  id: string;
  data: Partial<EditFacilityForm>;
}

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateFacilityRequest) =>
      updateFacility(id, data),
    onSuccess: () => {
      toast.success("Facility updated successfully");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      queryClient.invalidateQueries({ queryKey: ["facility"] });
    },
    onError: (error: any) => {
      toast.error(
        apiErrorMessage(error, "Failed to update facility")
      );
    },
  });

  return {
    updateFacility: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};
