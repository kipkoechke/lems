import { useQuery } from "@tanstack/react-query";
import {
  getDashboard,
  DashboardParams,
  DashboardResponse,
} from "@/services/apiDashboard";

export const useDashboard = (params: DashboardParams = {}) => {
  const {
    data: dashboardData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<DashboardResponse>({
    queryKey: ["admin-dashboard", params],
    queryFn: () => getDashboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Filter changes re-query; keep the previous dashboard on screen instead
    // of dropping back to the skeleton on every dropdown change.
    placeholderData: (previous) => previous,
  });

  return {
    dashboardData,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
