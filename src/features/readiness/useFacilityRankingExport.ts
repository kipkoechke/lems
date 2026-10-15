"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  getFacilityRanking,
  type FacilityRankingParams,
  type FacilityRankingSummary,
  type RankingRow,
} from "@/services/apiFacilityRanking";
import { rankingPdfFilename, type RankingPdfMeta } from "@/lib/rankingPdf";
import { apiErrorMessage } from "@/lib/apiError";

/**
 * Downloads the ranking as a PDF.
 *
 * It walks every page of the current filters rather than exporting the page on
 * screen: a report covering the twenty facilities the reader happened to be
 * looking at would be filed as the whole picture. The page size is the API's
 * maximum, so a full export is a handful of requests.
 *
 * The PDF library is pulled in through a dynamic import rather than a static
 * one, so it lives in a chunk of its own instead of in the page's bundle. Note
 * that the current build also emits that chunk as a preloaded script for this
 * route, so it is fetched on load as well — see the note in `rankingPdf.ts`.
 */
export const useFacilityRankingExport = (
  params: FacilityRankingParams,
  meta: RankingPdfMeta,
) => {
  const [isExporting, setIsExporting] = useState(false);

  const download = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const rows: RankingRow[] = [];
      let summary: FacilityRankingSummary | undefined;
      let page = 1;
      let lastPage = 1;

      do {
        const response = await getFacilityRanking({
          ...params,
          per_page: 100,
          page,
        });
        summary = summary ?? response.summary;
        rows.push(...response.data);
        lastPage = response.pagination?.last_page ?? 1;
        page += 1;
      } while (page <= lastPage);

      if (!rows.length) {
        toast.error("Nothing to export — no facilities match these filters.");
        return;
      }

      const { buildRankingPdf } = await import("@/lib/rankingPdf");
      buildRankingPdf(rows, summary, meta).save(rankingPdfFilename());
      toast.success(`Exported ${rows.length} facilities`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not build the PDF. Please try again."));
    } finally {
      setIsExporting(false);
    }
  };

  return { download, isExporting };
};
