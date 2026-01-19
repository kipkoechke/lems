import { getLots, Lot, PaginationMeta } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

export const useLots = (page: number = 1) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lots", page],
    queryFn: () => getLots(page),
  });

  return {
    lots: (data?.data || []) as Lot[],
    pagination: data?.pagination as PaginationMeta | undefined,
    isLoading,
    error,
    refetch,
  };
};
