import {
  EditFacilityForm,
  getFacilities,
  updateFacility,
} from "@/services/apiFacility";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useFacilities() {
  const {
    isLoading,
    data: facilities,
    error,
  } = useQuery({
    queryKey: ["facilities"],
    queryFn: getFacilities,
  });

  return { isLoading, facilities, error };
}

export function useUpdateFacility() {
  const queryClient = useQueryClient();
  const { mutate: editFacility, isPending: isEditing } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditFacilityForm }) => {
      return updateFacility(id, {
        name: data.name,
        code: data.code,
      });
    },
    onSuccess: () => {
      toast.success("Facility updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update facility"
      );
    },
  });

  return { editFacility, isEditing };
}
