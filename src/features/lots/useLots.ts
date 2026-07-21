import { getLots, Lot, PaginationMeta } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

/** Pass `undefined` to load every lot (used while searching). */
export const useLots = (page: number | undefined = 1) => {
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
