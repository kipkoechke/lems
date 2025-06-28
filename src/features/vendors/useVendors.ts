import { getVendors } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useVendors = () => {
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });

  return {
    vendors,
    isLoading,
    error,
    refetch,
  };
};
