import { useQuery } from "@tanstack/react-query";
import { getMyVendorProfile } from "@/services/apiVendors";
import { useCurrentFacility, useCurrentUserWithLoading } from "@/hooks/useAuth";

/**
 * Resolves the vendor record for the currently signed-in vendor user.
 *
 * The request goes to the token-scoped /vendor/profile route, so it fires even
 * when the login payload carries no vendor entity. The id below is only a
 * fallback for the older /vendors/{vendor} route; it must never gate the query,
 * or a missing entity means no request at all and the page renders an empty
 * state that looks like "no data" rather than "we don't know who you are".
 */
export const useMyVendor = () => {
  const { user, isLoading: userLoading } = useCurrentUserWithLoading();
  const facility = useCurrentFacility();

  const vendorId = user?.entity?.id || facility?.id || "";

  const {
    data,
    isLoading: vendorLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-vendor", vendorId],
    queryFn: () => getMyVendorProfile(vendorId || undefined),
    enabled: !userLoading,
  });

  return {
    vendor: data,
    // Prefer the id the API itself reports over whatever login stashed locally.
    vendorId: data?.id || vendorId,
    isLoading: userLoading || vendorLoading,
    error,
    refetch,
  };
};
