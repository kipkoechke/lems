import { useQuery } from "@tanstack/react-query";
import {
  getDeviceActivity,
  getPendingInstallation,
  DeviceActivityParams,
  PendingInstallationParams,
} from "@/services/apiPingRequests";

/**
 * The device activity log — every connect, worklist pull and study send that
 * has reached VEMS, whether or not it matched a known equipment record.
 */
export const useDeviceActivity = (params: DeviceActivityParams = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["device-activity", params],
    queryFn: () => getDeviceActivity(params),
    // Devices check in continuously; keep the log moving without a reload.
    refetchInterval: 30_000,
    placeholderData: (previous) => previous,
  });

  return {
    activity: data?.data ?? [],
    summary: data?.summary,
    pagination: data?.pagination,
    availableFilters: data?.available_filters,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

/** Equipment awaiting installation — typically unclaimed discovered devices. */
export const usePendingInstallation = (
  params: PendingInstallationParams = {},
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pending-installation", params],
    queryFn: () => getPendingInstallation(params),
    placeholderData: (previous) => previous,
  });

  return {
    equipments: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};
