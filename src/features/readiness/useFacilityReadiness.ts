"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { downloadCsv, datedFilename } from "@/lib/csv";
import { equipmentDeviceName } from "@/services/apiEquipment";
import {
  getFacilityReadiness,
  FacilityReadinessParams,
} from "@/services/apiFacilityReadiness";
import {
  getFacilityRanking,
  FacilityRankingParams,
} from "@/services/apiFacilityRanking";

export const useFacilityReadiness = (params: FacilityReadinessParams = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["facility-readiness", params],
    queryFn: () => getFacilityReadiness(params),
    // Filter changes re-query; keep the report on screen rather than dropping
    // back to a skeleton on every control.
    placeholderData: (previous) => previous,
  });

  return {
    facilities: data?.data ?? [],
    summary: data?.summary,
    availableFilters: data?.available_filters,
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

export const useFacilityRanking = (params: FacilityRankingParams = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["facility-ranking", params],
    queryFn: () => getFacilityRanking(params),
    placeholderData: (previous) => previous,
  });

  return {
    rows: data?.data ?? [],
    summary: data?.summary,
    availableFilters: data?.available_filters,
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

/**
 * Downloads the readiness report as a spreadsheet.
 *
 * Four columns — facility, equipment, when it was last seen, and who supplies
 * it. A blank "Last Seen" is the whole story for most rows: the machine has
 * never reached VEMS at all.
 *
 * It walks every page of the current filters rather than exporting the page
 * on screen, because a file covering twenty of six hundred facilities would be
 * read as the whole picture. The page size is the API's maximum, so a full
 * export is a handful of requests rather than dozens.
 */
export const useReadinessExport = (params: FacilityReadinessParams = {}) => {
  const [isExporting, setIsExporting] = useState(false);

  const download = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const rows: unknown[][] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await getFacilityReadiness({
          ...params,
          per_page: 100,
          page,
        });
        lastPage = response.pagination?.last_page ?? 1;

        for (const facility of response.data) {
          for (const equipment of facility.equipment) {
            rows.push([
              facility.facility.name,
              // The stored name repeats the facility after an em dash, which
              // is noise next to a facility column.
              equipmentDeviceName(equipment.name),
              equipment.activity?.last_seen_at
                ? new Date(equipment.activity.last_seen_at).toLocaleString(
                    "en-GB",
                  )
                : "Never",
              equipment.ownership_type === "vendor"
                ? (equipment.vendor?.name ?? "Vendor")
                : "Facility owned",
            ]);
          }
        }

        page += 1;
      } while (page <= lastPage);

      if (!rows.length) {
        toast.error("Nothing to export — no equipment matches these filters.");
        return;
      }

      downloadCsv(
        datedFilename("equipment-status"),
        ["Facility", "Equipment", "Last Seen", "Vendor"],
        rows,
      );
      toast.success(`Exported ${rows.length} machines`);
    } catch {
      toast.error("Could not build the export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return { download, isExporting };
};
