import { useQuery } from "@tanstack/react-query";
import { getLots } from "@/services/apiLots";

export const useLots = () => {
  const {
    data: lots = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["lots"],
    queryFn: getLots,
  });

  return {
    lots,
    isLoading,
    error,
    refetch,
  };
};
