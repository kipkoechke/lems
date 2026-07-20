import { useQuery } from "@tanstack/react-query";
import { getVendorBookings, getVendorBookingsPaginated } from "@/services/apiVendors";
import type { VendorBookingsParams } from "@/types/booking";

export const useVendorBookings = (vendorId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-bookings", vendorId],
    // /vendor/bookings infers the vendor from the token — the id is a cache key
    // only, and must not gate the request.
    queryFn: () => getVendorBookings(vendorId),
  });

  return { bookings: data ?? [], isLoading, error, refetch };
};

export const useVendorBookingsPaginated = (params: VendorBookingsParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-bookings-paginated", params],
    queryFn: () => getVendorBookingsPaginated(params),
  });

  return {
    summary: data?.summary ?? { not_started: 0, total: 0 },
    bookings: data?.data ?? [],
    pagination: data?.pagination ?? { current_page: 1, per_page: 20, total: 0, total_pages: 1 },
    availableFilters: data?.available_filters ?? { service_status: [], booking_status: [] },
    isLoading,
    error,
    refetch,
  };
};
