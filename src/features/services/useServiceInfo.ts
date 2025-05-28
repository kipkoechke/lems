import { getServiceInfo } from "@/services/apiServices";
import { useQuery } from "@tanstack/react-query";

export function useServiceInfos() {
  const {
    isPending: isServiceLoading,
    data: serviceInfos,
    error,
  } = useQuery({
    queryKey: ["info"],
    queryFn: getServiceInfo,
  });

  return { isServiceLoading, serviceInfos, error };
}
