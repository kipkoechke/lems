import { useQuery } from "@tanstack/react-query";
import { getVendors, Vendor } from "@/services/apiVendors";

export function useVendors() {
  return useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });
}
