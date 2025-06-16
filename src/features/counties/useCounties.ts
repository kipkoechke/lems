import { getCounties } from "@/services/apiCounty";
import { useQuery } from "@tanstack/react-query";

export function useCounties() {
  const {
    isLoading,
    data: counties = [],
    error,
  } = useQuery({
    queryKey: ["counties"],
    queryFn: getCounties,
  });

  return { isLoading, counties, error };
}
