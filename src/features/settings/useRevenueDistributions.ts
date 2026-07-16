import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createRevenueDistribution,
  getRevenueDistributions,
  RevenueDistributionCreateRequest,
  RevenueDistributionUpdateRequest,
  updateRevenueDistribution,
} from "@/services/apiRevenueDistributions";

const key = ["revenue-distributions"];

export const useRevenueDistributions = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: key,
    queryFn: getRevenueDistributions,
  });

  return { distributions: data ?? [], isLoading, error, refetch };
};

export const useCreateRevenueDistribution = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RevenueDistributionCreateRequest) =>
      createRevenueDistribution(data),
    onSuccess: () => {
      toast.success("Distribution created successfully");
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(
        error?.response?.data?.message || "Failed to create distribution",
      ),
  });

  return { createDistribution: mutate, isCreating: isPending };
};

export const useUpdateRevenueDistribution = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      distributionId,
      data,
    }: {
      distributionId: string;
      data: RevenueDistributionUpdateRequest;
    }) => updateRevenueDistribution(distributionId, data),
    onSuccess: () => {
      toast.success("Distribution updated successfully");
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: () => toast.error("Failed to update distribution"),
  });

  return { updateDistribution: mutate, isUpdating: isPending };
};
