import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/apiError";
import {
  createFacilityNew,
  CreateFacilityPayload,
} from "@/services/apiFacility";
import toast from "react-hot-toast";

export function useCreateFacility() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateFacilityPayload) => createFacilityNew(data),
    onSuccess: () => {
      toast.success("Facility created successfully!");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: (error: unknown) => {
      toast.error(apiErrorMessage(error, "Failed to create facility"));
    },
  });

  return {
    createFacility: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}
