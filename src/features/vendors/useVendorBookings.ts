import { useQuery } from "@tanstack/react-query";
import {
  getVendorBookings,
  VendorBookingsParams,
} from "@/services/apiVendorBookings";

export const useVendorBookings = (
  vendorId: string,
  params: VendorBookingsParams = {},
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-bookings", vendorId, params],
    queryFn: () => getVendorBookings(vendorId, params),
    enabled: !!vendorId,
  });

  return {
    bookings: data?.bookings ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};
