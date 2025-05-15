// hooks/useFacilityReport.ts
import { fetchFacilityReport } from "@/services/apiReport";
import { useQuery } from "@tanstack/react-query";

export const useFacilityReport = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["facilityReport", startDate, endDate],
    queryFn: () => fetchFacilityReport(startDate, endDate),
  });
};
