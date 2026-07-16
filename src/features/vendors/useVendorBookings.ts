import { useQuery } from "@tanstack/react-query";
import { getVendorBookings } from "@/services/apiVendors";

export const useVendorBookings = (vendorId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-bookings", vendorId],
    // /vendor/bookings infers the vendor from the token — the id is a cache key
    // only, and must not gate the request.
    queryFn: () => getVendorBookings(vendorId),
  });

  return { bookings: data ?? [], isLoading, error, refetch };
};
