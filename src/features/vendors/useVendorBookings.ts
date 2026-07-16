import { useQuery } from "@tanstack/react-query";
import { getVendorBookings } from "@/services/apiVendors";

export const useVendorBookings = (vendorId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-bookings", vendorId],
    queryFn: () => getVendorBookings(vendorId),
    enabled: !!vendorId,
  });

  return { bookings: data ?? [], isLoading, error, refetch };
};
