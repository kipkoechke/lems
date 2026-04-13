import {
  EditFacilityForm,
  FacilityQueryParams,
  PaginatedFacilityResponse,
  getFacilities,
  getFacilitiesPaginated,
  updateFacility,
} from "@/services/apiFacility";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useFacilities(
  params?: FacilityQueryParams,
  options?: { enabled?: boolean },
) {
  const {
    isLoading,
    data: facilities,
    error,
  } = useQuery({
    queryKey: ["facilities", params],
    queryFn: () => getFacilities(params),
    enabled: options?.enabled ?? true,
  });

  return {
    isLoading,
    facilities: facilities || [],
    error,
  };
}

export function useFacilitiesPaginated(params?: FacilityQueryParams) {
  // Create a stable query key by stringifying the params
  const queryKey = ["facilities-paginated", JSON.stringify(params || {})];

  const {
    isLoading,
    data: paginatedData,
    error,
  } = useQuery<PaginatedFacilityResponse>({
    queryKey,
    queryFn: () => getFacilitiesPaginated(params),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  return {
    isLoading,
    facilities: paginatedData?.data || [],
    pagination: paginatedData
      ? {
          currentPage: paginatedData.current_page,
          lastPage: paginatedData.last_page,
          perPage: paginatedData.per_page,
          total: paginatedData.total,
        }
      : null,
    error,
  };
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
          "Failed to update facility",
      );
    },
  });

  return { editFacility, isEditing };
}
