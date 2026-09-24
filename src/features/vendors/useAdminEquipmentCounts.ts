import { useQuery } from "@tanstack/react-query";
import {
  getAdminEquipmentModalityCounts,
  AdminEquipmentParams,
} from "@/services/apiEquipment";
import { getDashboard } from "@/services/apiDashboard";

type CountParams = Pick<
  AdminEquipmentParams,
  "status" | "vendor_id" | "facility_id" | "linked" | "search"
>;

/**
 * Modality breakdown for the equipment summary cards.
 *
 * `/admin/dashboard` already reports this breakdown in a single request, and
 * accepts the facility and vendor filters, so that is the source wherever it
 * can answer the question. The fallback tallies the listing by paging it,
 * which on a full register is several hundred kilobytes over half a dozen
 * requests — worth it only for the filters the dashboard does not take.
 */
export const useAdminEquipmentCounts = (params: CountParams = {}) => {
  const dashboardAnswers =
    !params.status && !params.search && params.linked === undefined;

  const dashboardParams = {
    facility_id: params.facility_id,
    vendor_id: params.vendor_id,
  };

  const dashboard = useQuery({
    // Same key the dashboard page uses, so the two share one cache entry.
    queryKey: ["admin-dashboard", dashboardParams],
    queryFn: () => getDashboard(dashboardParams),
    enabled: dashboardAnswers,
    staleTime: 1000 * 60 * 5,
  });

  const tally = useQuery({
    queryKey: ["admin-equipment-modality-counts", params],
    queryFn: () => getAdminEquipmentModalityCounts(params),
    enabled: !dashboardAnswers,
    staleTime: 1000 * 60 * 5,
  });

  if (dashboardAnswers) {
    const modalities = dashboard.data?.modalities ?? [];
    return {
      counts: modalities.map((modality) => ({
        code: modality.modality,
        label: modality.label,
        count: modality.count,
      })),
      total: dashboard.data?.counts?.total_equipment ?? 0,
      truncated: false,
      isLoading: dashboard.isLoading,
      error: dashboard.error,
    };
  }

  return {
    counts: tally.data?.counts ?? [],
    total: tally.data?.total ?? 0,
    truncated: tally.data?.truncated ?? false,
    isLoading: tally.isLoading,
    error: tally.error,
  };
};
