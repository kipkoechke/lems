import type { BookingFilters } from "@/types/booking";

/**
 * Filters behind the facility dashboard's booking list.
 *
 * Shared so the post-login prefetch and the dashboard itself build the exact
 * same react-query key — a mismatch means the prefetch warms a cache entry the
 * page never reads.
 */
export const facilityDashboardFilters = (
  facilityId?: string | null,
): BookingFilters => ({
  facility_id: facilityId || undefined,
  page: 1,
  per_page: 8,
  sort_by: "created_at",
  sort_order: "desc",
});
