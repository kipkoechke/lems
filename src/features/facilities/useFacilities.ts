import {
  EditFacilityForm,
  FacilityQueryParams,
  PaginatedFacilityResponse,
  buildAdvancedFacilitySearchParams,
  getFacilities,
  getFacilitiesPaginated,
  parseSearchParamsFromUrl,
  updateFacility,
  updateUrlWithSearchParams,
} from "@/services/apiFacility";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useFacilities(params?: FacilityQueryParams) {
  const {
    isLoading,
    data: facilities,
    error,
  } = useQuery({
    queryKey: ["facilities", params],
    queryFn: () => getFacilities(params),
  });

  return {
    isLoading,
    facilities: facilities || [], // Ensure it's always an array
    error,
  };
}

export function useFacilitiesPaginated(params?: FacilityQueryParams) {
  const {
    isLoading,
    data: paginatedData,
    error,
  } = useQuery<PaginatedFacilityResponse>({
    queryKey: ["facilities-paginated", params],
    queryFn: () => getFacilitiesPaginated(params),
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

export function useFacilitySearch(
  searchTerm: string,
  filters?: {
    facilityType?: string;
    owner?: string;
    regulatoryStatus?: string;
    operationStatus?: string;
    kephLevel?: string;
    countyId?: string;
    subCountyId?: string;
    wardId?: string;
    isActive?: string;
  }
) {
  const searchParams = buildAdvancedFacilitySearchParams({
    searchTerm,
    ...filters,
  });

  const {
    isLoading,
    data: facilities,
    error,
  } = useQuery({
    queryKey: ["facilities-search", searchParams],
    queryFn: () => getFacilities(searchParams),
    enabled: !!searchTerm || Object.keys(filters || {}).length > 0, // Only run if there's a search term or filters
  });

  return {
    isLoading,
    facilities: facilities || [],
    error,
  };
}

export function useFacilitySimpleSearch(searchTerm: string) {
  const {
    isLoading,
    data: facilities,
    error,
  } = useQuery({
    queryKey: ["facilities-simple-search", searchTerm],
    queryFn: () => getFacilities({ search: searchTerm }),
    enabled: !!searchTerm?.trim(), // Only run if there's a search term
  });

  return {
    isLoading,
    facilities: facilities || [],
    error,
  };
}

export function useFacilitySearchWithUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [queryParams, setQueryParams] = useState<Partial<FacilityQueryParams>>(
    {}
  );

  // Initialize from URL on mount
  useEffect(() => {
    const params = parseSearchParamsFromUrl(searchParams);
    setQueryParams(params);
  }, [searchParams]);

  // Update URL when query params change
  const updateSearch = useCallback(
    (newParams: Partial<FacilityQueryParams>) => {
      const updatedParams = { ...queryParams, ...newParams };

      // Remove undefined/null/empty values
      const cleanParams = Object.entries(updatedParams).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      setQueryParams(cleanParams);
      updateUrlWithSearchParams(router, "/facilities", cleanParams);
    },
    [queryParams, router]
  );

  // Reset search
  const clearSearch = useCallback(() => {
    setQueryParams({});
    router.replace("/facilities", { scroll: false });
  }, [router]);

  // Set specific search term
  const setSearchTerm = useCallback(
    (search: string) => {
      const newParams = { ...queryParams };
      if (search.trim()) {
        newParams.search = search.trim();
        newParams.page = 1; // Reset to first page when searching
      } else {
        delete newParams.search;
        delete newParams.page; // Also remove page when clearing search
      }
      updateSearch(newParams);
    },
    [queryParams, updateSearch]
  );

  // Set page
  const setPage = useCallback(
    (page: number) => {
      updateSearch({ page: page > 1 ? page : undefined });
    },
    [updateSearch]
  );

  // Get facilities with current params
  const {
    isLoading,
    data: paginatedData,
    error,
  } = useQuery<PaginatedFacilityResponse>({
    queryKey: ["facilities-url-search", queryParams],
    queryFn: () => getFacilitiesPaginated(queryParams),
  });

  return {
    // Data
    isLoading,
    facilities: paginatedData?.data || [],
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

    // Current search state
    searchTerm: queryParams.search || "",
    currentPage: queryParams.page || 1,
    filters: queryParams,

    // Actions
    setSearchTerm,
    setPage,
    updateSearch,
    clearSearch,
  };
}
