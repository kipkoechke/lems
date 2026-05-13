import { getCounties, getSubCounties, getWards } from "@/services/apiCounty";
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

export function useSubCounties(county_id: string) {
  const {
    isLoading,
    data: subCounties = [],
    error,
  } = useQuery({
    queryKey: ["sub-counties", county_id],
    queryFn: () => getSubCounties(county_id),
    enabled: !!county_id, // Only fetch if county_id is provided
  });

  return { isLoading, subCounties, error };
}

export function useWards(sub_county_id: string) {
  const {
    isLoading,
    data: wards = [],
    error,
  } = useQuery({
    queryKey: ["wards", sub_county_id],
    queryFn: () => getWards(sub_county_id),
    enabled: !!sub_county_id, // Only fetch if sub_county_id is provided
  });

  return { isLoading, wards, error };
}
