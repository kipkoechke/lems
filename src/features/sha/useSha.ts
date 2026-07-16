import { useQuery } from "@tanstack/react-query";
import {
  getShaInterventions,
  ShaInterventionParams,
} from "@/services/apiSha";

export const useShaInterventions = (params: ShaInterventionParams = {}) => {
  // Every filter is optional, but an unfiltered call can be very broad — only
  // fetch once the operator has supplied at least one identifier.
  const hasFilter = Object.values(params).some((v) => !!v);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sha-interventions", params],
    queryFn: () => getShaInterventions(params),
    enabled: hasFilter,
  });

  return {
    interventions: data ?? [],
    hasFilter,
    isLoading,
    error,
    refetch,
  };
};
