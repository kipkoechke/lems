import { useQuery } from "@tanstack/react-query";
import { fetchVendorBatches } from "@/services/apiSyncBooking";

interface UseVendorBatchesParams {
  page?: number;
}

export const useVendorBatches = ({ page = 1 }: UseVendorBatchesParams = {}) => {
  const {
    data: vendorBatchesResponse,
    isLoading,
    error,
    refetch: refetchVendorBatches,
  } = useQuery({
    queryKey: ["vendorBatches", page],
    queryFn: () => fetchVendorBatches(page),
  });

  return {
    vendorBatches: vendorBatchesResponse?.data || [],
    pagination: vendorBatchesResponse
      ? {
          currentPage: vendorBatchesResponse.current_page,
          totalPages: vendorBatchesResponse.last_page,
          total: vendorBatchesResponse.total,
          from: vendorBatchesResponse.from,
          to: vendorBatchesResponse.to,
        }
      : null,
    isLoading,
    error,
    refetchVendorBatches,
  };
};
