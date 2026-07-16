import { useQuery } from "@tanstack/react-query";
import { getVendor } from "@/services/apiVendors";
import { useCurrentFacility, useCurrentUserWithLoading } from "@/hooks/useAuth";

/**
 * Resolves the vendor record for the currently signed-in vendor user.
 *
 * The vendor id normally arrives on `user.entity.id`. Older sessions stored it
 * on the `facility` slot instead (login persists the vendor entity there too),
 * so fall back to that before giving up — otherwise every vendor query silently
 * disables itself and the page renders an empty state that looks like "no data"
 * rather than "we don't know who you are".
 */
export const useMyVendor = () => {
  const { user, isLoading: userLoading } = useCurrentUserWithLoading();
  const facility = useCurrentFacility();

  const vendorId = user?.entity?.id || facility?.id || "";

  // Only a resolved vendor account with no id is a real problem; while auth is
  // still loading we simply don't know yet.
  const isVendorUser = user?.role === "vendor";
  const missingVendorId = !userLoading && isVendorUser && !vendorId;

  const {
    data,
    isLoading: vendorLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => getVendor(vendorId),
    enabled: !!vendorId,
  });

  return {
    vendor: data,
    vendorId,
    missingVendorId,
    isLoading: userLoading || (!!vendorId && vendorLoading),
    error,
    refetch,
  };
};
