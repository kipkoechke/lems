import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  approvePingRequest,
  getPendingPingRequests,
  PingRequestDecision,
  rejectPingRequest,
} from "@/services/apiPingRequests";

const key = ["ping-requests"];

export const usePendingPingRequests = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...key, "pending"],
    queryFn: getPendingPingRequests,
    // Devices ping continuously; keep the approval queue live without
    // requiring the operator to reload.
    refetchInterval: 15_000,
  });

  return { pingRequests: data ?? [], isLoading, error, refetch };
};

export const useApprovePingRequest = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      pingRequestId,
      data,
    }: {
      pingRequestId: string;
      data?: PingRequestDecision;
    }) => approvePingRequest(pingRequestId, data),
    onSuccess: () => {
      toast.success("Ping request approved");
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to approve request"),
  });

  return { approveRequest: mutate, isApproving: isPending };
};

export const useRejectPingRequest = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      pingRequestId,
      data,
    }: {
      pingRequestId: string;
      data?: PingRequestDecision;
    }) => rejectPingRequest(pingRequestId, data),
    onSuccess: () => {
      toast.success("Ping request rejected");
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to reject request"),
  });

  return { rejectRequest: mutate, isRejecting: isPending };
};
