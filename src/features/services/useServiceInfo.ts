import { getServiceInfo } from "@/services/apiServiceInfo";
import { useQuery } from "@tanstack/react-query";

export function useServiceInfos() {
  const {
    isLoading,
    data: serviceInfos,
    error,
  } = useQuery({
    queryKey: ["info"],
    queryFn: getServiceInfo,
  });

  return { isLoading, serviceInfos, error };
}
