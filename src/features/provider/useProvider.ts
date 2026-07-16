import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  assignProviderClaim,
  getProviderBooking,
  getProviderBookingCosts,
  getProviderBookings,
} from "@/services/apiProvider";

export const useProviderBookings = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["provider-bookings"],
    queryFn: getProviderBookings,
  });

  return { bookings: data ?? [], isLoading, error, refetch };
};

export const useProviderBooking = (visitId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["provider-booking", visitId],
    queryFn: () => getProviderBooking(visitId),
    enabled: !!visitId,
  });

  return { booking: data, isLoading, error, refetch };
};

export const useProviderBookingCosts = (visitId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["provider-booking", visitId, "costs"],
    queryFn: () => getProviderBookingCosts(visitId),
    enabled: !!visitId,
  });

  return { costs: data, isLoading, error };
};

export const useAssignProviderClaim = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ visitId, claimId }: { visitId: string; claimId: string }) =>
      assignProviderClaim(visitId, claimId),
    onSuccess: () => {
      toast.success("Claim ID assigned to booking");
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["provider-booking"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to assign claim ID"),
  });

  return { assignClaim: mutate, isAssigning: isPending };
};
