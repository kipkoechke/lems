import { getFacilitiesReport } from "@/services/apiReport";
import { useQuery } from "@tanstack/react-query";

export const useFacilityReport = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["facilityReport", startDate, endDate],
    queryFn: () => getFacilitiesReport(startDate, endDate),
  });
};
