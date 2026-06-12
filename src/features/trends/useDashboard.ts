import { useQuery } from "@tanstack/react-query";
import { getDashboard, DashboardResponse } from "@/services/apiDashboard";

export const useDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardResponse>({
    queryKey: ["admin-dashboard"],
    queryFn: () => getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
  };
};
