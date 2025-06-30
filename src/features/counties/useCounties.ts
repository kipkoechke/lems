import { getCounties, getSubCounties } from "@/services/apiCounty";
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

export function useSubCounties(county_code: string) {
  const {
    isLoading,
    data: subCounties = [],
    error,
  } = useQuery({
    queryKey: ["sub-counties", county_code],
    queryFn: () => getSubCounties(county_code),
    enabled: !!county_code, // Only fetch if county_code is provided
  });

  return { isLoading, subCounties, error };
}
