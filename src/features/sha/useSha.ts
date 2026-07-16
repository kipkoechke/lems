import { useQuery } from "@tanstack/react-query";
import { getShaInterventions } from "@/services/apiSha";

export const useShaInterventions = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sha-interventions"],
    queryFn: getShaInterventions,
  });

  return { lots: data ?? [], isLoading, error, refetch };
};
