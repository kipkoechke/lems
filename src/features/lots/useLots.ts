import { getLots } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

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
