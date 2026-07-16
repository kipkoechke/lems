import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  cancelMedicalRequest,
  getEligibleEquipment,
  getMedicalRequest,
  getMedicalRequests,
  getRequestCallbackLogs,
  getRequestStats,
  MedicalRequestListParams,
  regenerateMwl,
  retargetMedicalRequest,
  RetargetRequest,
} from "@/services/apiRequests";

export const useMedicalRequests = (params: MedicalRequestListParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["requests", params],
    queryFn: () => getMedicalRequests(params),
  });

  return {
    requests: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useMedicalRequest = (requestId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["request", requestId],
    queryFn: () => getMedicalRequest(requestId),
    enabled: !!requestId,
  });

  return { request: data, isLoading, error, refetch };
};

export const useRequestStats = (params?: {
  facility_id?: string;
  days?: number;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["requests", "stats", params],
    queryFn: () => getRequestStats(params),
  });

  return { stats: data, isLoading, error };
};

export const useRequestCallbackLogs = (requestId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["request", requestId, "callback-logs"],
    queryFn: () => getRequestCallbackLogs(requestId),
    enabled: !!requestId,
  });

  return { logs: data ?? [], isLoading, error };
};

export const useEligibleEquipment = (requestId: string, facilityId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["request", requestId, "eligible-equipment", facilityId],
    queryFn: () => getEligibleEquipment(requestId, facilityId),
    enabled: !!requestId,
  });

  return { equipment: data ?? [], isLoading, error };
};

export const useCancelMedicalRequest = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (requestId: string) => cancelMedicalRequest(requestId),
    onSuccess: () => {
      toast.success("Request cancelled");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to cancel request"),
  });

  return { cancelRequest: mutate, isCancelling: isPending };
};

export const useRetargetMedicalRequest = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: RetargetRequest;
    }) => retargetMedicalRequest(requestId, data),
    onSuccess: (result) => {
      toast.success(result?.status_message || "Request retargeted");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to retarget request"),
  });

  return { retargetRequest: mutate, isRetargeting: isPending };
};

export const useRegenerateMwl = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (requestId: string) => regenerateMwl(requestId),
    onSuccess: (result) => {
      // Surface partial failures rather than a blanket success.
      if (result?.failed && result.failed > 0) {
        toast.error(
          `MWL regenerated with ${result.failed} failure(s) — ${result.succeeded ?? 0} succeeded`,
        );
      } else {
        toast.success(result?.status_message || "MWL regenerated");
      }
      queryClient.invalidateQueries({ queryKey: ["request"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to regenerate MWL"),
  });

  return { regenerate: mutate, isRegenerating: isPending };
};
