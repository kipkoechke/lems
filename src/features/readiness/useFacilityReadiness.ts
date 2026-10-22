"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { downloadCsv, datedFilename } from "@/lib/csv";
import { equipmentDeviceName } from "@/services/apiEquipment";
import {
  getFacilityReadiness,
  getFacilityResults,
  FacilityReadinessParams,
} from "@/services/apiFacilityReadiness";
import {
  getAllFacilityRanking,
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

export const useFacilityRanking = (
  params: FacilityRankingParams = {},
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["facility-ranking", params],
    queryFn: () => getFacilityRanking(params),
    placeholderData: (previous) => previous,
    enabled,
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
 * The whole ranking for these filters, for an order the API cannot apply.
 * Only runs when asked to, so the ordinary paged view never pays for it.
 */
export const useFullFacilityRanking = (
  params: FacilityRankingParams,
  enabled: boolean,
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["facility-ranking-all", params],
    queryFn: () => getAllFacilityRanking(params),
    placeholderData: (previous) => previous,
    enabled,
  });

  return {
    rows: data?.rows ?? [],
    summary: data?.summary,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Each facility's results-sent facts, folded from the readiness report.
 * They change as studies arrive rather than with the ranking's filters, so
 * one fetch serves every filter and order, and is kept for a few minutes.
 */
export const useFacilityResults = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["facility-results"],
    queryFn: getFacilityResults,
    staleTime: 5 * 60 * 1000,
  });

  return { results: data, isLoading };
};

/**
 * Downloads the readiness report as a spreadsheet.
 *
 * The columns follow the four checks the report is built on. Status collapses
 * two of them, because "Connected" already implies linked: a machine reachable
 * right now has plainly reached VEMS before. Every cell is written as a word —
 * "Not Linked", "Never", "No" — rather than as a dash, so a row means the same
 * thing read on its own as it does read against the legend.
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
            const { linked, live, worklist_ready, results_ready } =
              equipment.checks;

            rows.push([
              facility.facility.name,
              // The stored name repeats the facility after an em dash, which
              // is noise next to a facility column.
              equipmentDeviceName(equipment.name),
              equipment.modality ?? "",
              equipment.ownership_type === "vendor"
                ? (equipment.vendor?.name ?? "Vendor")
                : "Facility owned",
              live ? "Connected" : linked ? "Linked" : "Not Linked",
              equipment.activity?.last_seen_at
                ? new Date(equipment.activity.last_seen_at).toLocaleString(
                    "en-GB",
                  )
                : "Never",
              // Both are evidence, not configuration: a study has actually
              // come back, a worklist has actually been pulled.
              results_ready ? "Yes" : "No",
              worklist_ready ? "Yes" : "No",
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
        [
          "Facility",
          "Equipment",
          "Modality",
          "Vendor",
          "Status",
          "Last Seen",
          "Sending Results",
          "Querying Worklist",
        ],
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
