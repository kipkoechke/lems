"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  getAllFacilityRanking,
  isClientOrder,
  orderByLastResult,
  RANKING_ORDER_OPTIONS,
  withResults,
  type FacilityRankingParams,
  type RankingOrder,
} from "@/services/apiFacilityRanking";
import { getFacilityResults } from "@/services/apiFacilityReadiness";
import { rankingPdfFilename, type RankingPdfMeta } from "@/lib/rankingPdf";
import { apiErrorMessage } from "@/lib/apiError";

/**
 * Downloads the ranking as a PDF, in whichever order is asked for.
 *
 * The order is chosen at download time rather than read from the screen, so
 * one menu can produce the ranking by completion rate, by claims, by last
 * result sent and so on without the reader re-sorting the page for each.
 *
 * It walks every page of the current filters rather than exporting the page on
 * screen: a report covering the twenty facilities the reader happened to be
 * looking at would be filed as the whole picture. Each facility's results-sent
 * facts are folded in from the readiness report.
 *
 * The PDF library is pulled in through a dynamic import rather than a static
 * one, so it lives in a chunk of its own instead of in the page's bundle. Note
 * that the current build also emits that chunk as a preloaded script for this
 * route, so it is fetched on load as well — see the note in `rankingPdf.ts`.
 */
export const useFacilityRankingExport = (
  /** The ranking's filters, without an order: each download brings its own. */
  params: Omit<FacilityRankingParams, "sort_by" | "sort_order">,
  meta: Omit<RankingPdfMeta, "sortBy" | "sortOrder">,
) => {
  const [exporting, setExporting] = useState<RankingOrder | null>(null);

  const download = async (order: RankingOrder) => {
    if (exporting) return;
    setExporting(order);

    try {
      const clientOrder = isClientOrder(order);
      const [{ rows, summary }, results] = await Promise.all([
        getAllFacilityRanking({
          ...params,
          // The API cannot order by last result; any of its orders will do
          // as the starting point, and booking volume breaks the ties.
          sort_by: clientOrder ? "total_bookings" : order,
          sort_order: "desc",
        }),
        getFacilityResults(),
      ]);

      if (!rows.length) {
        toast.error("Nothing to export — no facilities match these filters.");
        return;
      }

      const merged = withResults(rows, results);
      const ordered = clientOrder ? orderByLastResult(merged) : merged;
      const label =
        RANKING_ORDER_OPTIONS.find((option) => option.value === order)?.label ??
        "Total bookings";

      const { buildRankingPdf } = await import("@/lib/rankingPdf");
      buildRankingPdf(ordered, summary, {
        ...meta,
        sortBy: label,
        sortOrder: "desc",
      }).save(rankingPdfFilename(order));
      toast.success(
        `Exported ${rows.length} facilities by ${label.toLowerCase()}`,
      );
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "Could not build the PDF. Please try again."),
      );
    } finally {
      setExporting(null);
    }
  };

  return { download, exporting, isExporting: exporting !== null };
};
