import { useQuery } from "@tanstack/react-query";
import { fetchSyncedBookings, SyncBookingsResponse } from "@/services/apiSyncBooking";

interface UseSyncedBookingsOptions {
  page?: number;
  filters?: {
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    facility_id?: string;
  };
}

export const useSyncedBookings = (options: UseSyncedBookingsOptions = {}) => {
  const { page = 1, filters } = options;

  const queryKey = ["syncedBookings", page, filters];

  const {
    data,
    isLoading,
    error,
    refetch: refetchSyncedBookings,
  } = useQuery<SyncBookingsResponse>({
    queryKey,
    queryFn: () => fetchSyncedBookings(page, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    syncedBookings: data?.results?.data || [],
    pagination: data?.results
      ? {
          currentPage: data.results.current_page,
          totalPages: data.results.last_page,
          total: data.results.total,
          perPage: data.results.per_page,
          from: data.results.from,
          to: data.results.to,
        }
      : null,
    isLoading,
    error,
    refetchSyncedBookings,
  };
};
