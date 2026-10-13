"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { downloadCsv, datedFilename } from "@/lib/csv";
import { equipmentDeviceName } from "@/services/apiEquipment";
import {
  getEquipmentUtilization,
  EquipmentUtilizationParams,
} from "@/services/apiEquipmentUtilization";

export const useEquipmentUtilization = (
  params: EquipmentUtilizationParams = {},
) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["equipment-utilization", params],
    queryFn: () => getEquipmentUtilization(params),
    // Changing a filter re-queries; keep the table on screen rather than
    // dropping back to a skeleton on every control.
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
 * Downloads the report as a spreadsheet.
 *
 * It walks every page of the current filters rather than exporting the page on
 * screen, because a file covering twenty of six hundred machines would be read
 * as the whole picture. The page size is the API's maximum, so a full export
 * is a handful of requests rather than dozens.
 *
 * The columns are the counts themselves rather than a verdict derived from
 * them: the report is read to see which machines are actually working and
 * which are idle, and a derived "is it pulling?" column would hide the
 * difference between a machine that has pulled nothing and one that has pulled
 * a little.
 */
export const useEquipmentUtilizationExport = (
  params: EquipmentUtilizationParams = {},
) => {
  const [isExporting, setIsExporting] = useState(false);

  const download = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const rows: unknown[][] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await getEquipmentUtilization({
          ...params,
          per_page: 100,
          page,
        });
        lastPage = response.pagination?.last_page ?? 1;

        for (const row of response.data) {
          rows.push([
            // The generated name repeats the facility after an em dash, which
            // is noise next to a facility column.
            equipmentDeviceName(row.equipment.name),
            row.equipment.code,
            row.equipment.modality ?? "",
            row.equipment.category_label ?? row.equipment.category ?? "",
            row.ae_title ?? "",
            row.facility?.name ?? "Not mapped",
            row.vendor?.name ?? "Not mapped",
            row.linked ? "Linked" : "Never linked",
            row.live ? "Live" : "Not connected",
            row.worklist_count,
            row.pulled_count,
            row.study_results_sent,
            row.non_sha_sent_count,
            // The API already returns one decimal and 0 for no worklists, so
            // it is written as given rather than recomputed here.
            `${row.conversion_rate}%`,
            row.last_seen_at
              ? new Date(row.last_seen_at).toLocaleString("en-GB")
              : "Never",
          ]);
        }

        page += 1;
      } while (page <= lastPage);

      if (!rows.length) {
        toast.error("Nothing to export — no equipment matches these filters.");
        return;
      }

      downloadCsv(
        datedFilename("equipment-utilization"),
        [
          "Equipment",
          "Code",
          "Modality",
          "Category",
          "AE Title",
          "Facility",
          "Vendor",
          "Link status",
          "Connection",
          "Worklists",
          "Pulled",
          "Study results sent",
          "Non-SHA sent",
          "Conversion rate",
          "Last seen",
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
