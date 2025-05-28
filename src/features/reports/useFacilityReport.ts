import { getFacilitiesReport } from "@/services/apiReport";
import { useQuery } from "@tanstack/react-query";

export const useFacilityReport = () => {
  const { data: facilitiesReport, isPending } = useQuery({
    queryKey: ["facilityReport"],
    queryFn: () => getFacilitiesReport(),
  });

  return { facilitiesReport, isPending };
};
