import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createEquipmentStatusLog,
  EquipmentStatusCreateRequest,
  EquipmentStatusListParams,
  getActiveDowntimes,
  getEquipmentStatusLogs,
  getEquipmentStatusSummary,
} from "@/services/apiEquipmentStatus";

export const useEquipmentStatusLogs = (
  params: EquipmentStatusListParams = {},
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["equipment-status", params],
    queryFn: () => getEquipmentStatusLogs(params),
  });

  return {
    logs: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useEquipmentStatusSummary = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["equipment-status", "summary"],
    queryFn: getEquipmentStatusSummary,
  });

  return { summary: data, isLoading, error };
};

export const useActiveDowntimes = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["equipment-status", "active-downtimes"],
    queryFn: getActiveDowntimes,
  });

  return { downtimes: data ?? [], isLoading, error };
};

export const useCreateEquipmentStatusLog = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EquipmentStatusCreateRequest) =>
      createEquipmentStatusLog(data),
    onSuccess: () => {
      toast.success("Status change logged");
      queryClient.invalidateQueries({ queryKey: ["equipment-status"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(
        error?.response?.data?.message || "Failed to log status change",
      ),
  });

  return { logStatusChange: mutate, isLogging: isPending };
};
