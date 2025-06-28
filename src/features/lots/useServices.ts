import { getServices } from "@/services/apiLots";
import { useQuery } from "@tanstack/react-query";

export const useServices = () => {
  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  return {
    services,
    isLoading,
    error,
    refetch,
  };
};
