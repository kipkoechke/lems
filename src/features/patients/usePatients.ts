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
    pagination: paginatedData
      ? {
          currentPage: paginatedData.current_page,
          lastPage: paginatedData.last_page,
          perPage: paginatedData.per_page,
          total: paginatedData.total,
          from: paginatedData.from,
          to: paginatedData.to,
          links: paginatedData.links,
          nextPageUrl: paginatedData.next_page_url,
          prevPageUrl: paginatedData.prev_page_url,
        }
      : null,
    error,
  };
}
