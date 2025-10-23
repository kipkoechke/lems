import {
  getRegisteredPatients,
  getRegisteredPatientsPaginated,
  PaginatedPatientResponse,
  PatientQueryParams,
} from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";

export function usePatients(params?: PatientQueryParams) {
  const {
    isPending: isLoading,
    data: patients,
    error,
  } = useQuery({
    queryKey: ["patients", params],
    queryFn: () => getRegisteredPatients(params),
  });

  return {
    isLoading,
    patients: patients || [], // Ensure it's always an array
    error,
  };
}

export function usePatientsPaginated(params?: PatientQueryParams) {
  const {
    isPending: isLoading,
    data: paginatedData,
    error,
  } = useQuery<PaginatedPatientResponse>({
    queryKey: ["patients-paginated", params],
    queryFn: () => getRegisteredPatientsPaginated(params),
  });

  return {
    isLoading,
    patients: paginatedData?.data || [],
    pagination: paginatedData?.pagination
      ? {
          currentPage: paginatedData.pagination.current_page,
          lastPage: paginatedData.pagination.last_page,
          perPage: paginatedData.pagination.per_page,
          total: paginatedData.pagination.total,
          from: paginatedData.pagination.from,
          to: paginatedData.pagination.to,
          links: [],
          nextPageUrl: null,
          prevPageUrl: null,
        }
      : null,
    error,
  };
}
