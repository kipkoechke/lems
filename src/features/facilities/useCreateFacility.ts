import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create facility";
      toast.error(message);
    },
  });

  return {
    createFacility: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}
