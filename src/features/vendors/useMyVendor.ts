import { useQuery } from "@tanstack/react-query";
import { getVendorById } from "@/services/apiVendors";
import { useCurrentUser } from "@/hooks/useAuth";

/**
 * Resolves the vendor record for the currently signed-in vendor user.
 * Vendor users carry their vendor id on `user.entity.id`.
 */
export const useMyVendor = () => {
  const user = useCurrentUser();
  const vendorId = user?.entity?.id || "";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendorById(vendorId),
    enabled: !!vendorId,
  });

  return { vendor: data, vendorId, isLoading, error, refetch };
};
