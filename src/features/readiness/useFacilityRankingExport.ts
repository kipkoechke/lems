"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  getAllFacilityRanking,
  isClientOrder,
  applyClientOrder,
  getFacilityMachines,
  RANKING_ORDER_OPTIONS,
  REPORT_ONLY_ORDERS,
  withMachines,
  type FacilityRankingParams,
  type ReportOrder,
} from "@/services/apiFacilityRanking";
import { getBookingResultsByFacility } from "@/services/apiBookingResults";

import {
  rankingPdfFilename,
  type RankingPdfMeta,
  type ReportRow,
} from "@/lib/rankingPdf";
import { apiErrorMessage } from "@/lib/apiError";

/**
 * Most results back first, then booking volume — so facilities with none
 * still sit in booking order at the foot, busiest first.
 */
const byResultsBack = (rows: ReportRow[]): ReportRow[] =>
  [...rows]
    .sort((a, b) => {
      const back =
        (b.results?.resultsBack ?? 0) - (a.results?.resultsBack ?? 0);
      if (back) return back;
      return b.bookings.total - a.bookings.total;
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));

/**
 * Downloads the facility performance report, in whichever order is asked for.
 *
 * The order is chosen at download time rather than read from the screen, so
 * one menu produces the report by completion rate, by claims, by results back
 * and so on without the reader re-sorting the page for each.
 *
 * It covers every facility the filters select, not the page on screen. Three
 * sources are folded together: the ranking itself, each facility's machines,
 * and the results its bookings got back — the last walks every booking in the
 * period, which is most of the wait, so `progress` reports how far it is.
 *
 * The PDF library is pulled in through a dynamic import, so it lives in a
 * chunk of its own instead of in the page's bundle.
 */
export const useFacilityRankingExport = (
  /** The ranking's filters, without an order: each download brings its own. */
  params: Omit<FacilityRankingParams, "sort_by" | "sort_order">,
  meta: Omit<RankingPdfMeta, "sortBy" | "sortOrder">,
) => {
  const [exporting, setExporting] = useState<ReportOrder | null>(null);
  const [progress, setProgress] = useState(0);

  const download = async (order: ReportOrder) => {
    if (exporting) return;
    setExporting(order);
    setProgress(0);

    try {
      const apiOrder =
        order === "results_back" || isClientOrder(order)
          ? "total_bookings"
          : order;
      const [{ rows, summary }, machines, results] = await Promise.all([
        getAllFacilityRanking({
          ...params,
          sort_by: apiOrder,
          sort_order: "desc",
        }),
        getFacilityMachines(),
        getBookingResultsByFacility(params.period, (done, total) =>
          setProgress(Math.round((done / total) * 100)),
        ),
      ]);

      if (!rows.length) {
        toast.error("Nothing to export — no facilities match these filters.");
        return;
      }

      const merged: ReportRow[] = withMachines(rows, machines).map((row) => ({
        ...row,
        results: results[row.facility.id],
      }));
      const ordered =
        order === "results_back"
          ? byResultsBack(merged)
          : isClientOrder(order)
            ? (applyClientOrder(order, merged) as ReportRow[])
            : merged;
      const label =
        [...RANKING_ORDER_OPTIONS, ...REPORT_ONLY_ORDERS].find(
          (option) => option.value === order,
        )?.label ?? "Total bookings";

      const { buildRankingPdf } = await import("@/lib/rankingPdf");
      buildRankingPdf(ordered, summary, {
        ...meta,
        sortBy: label,
        sortOrder: "desc",
      }).save(rankingPdfFilename(order));
      toast.success(
        `Report ready: ${rows.length} facilities by ${label.toLowerCase()}`,
      );
    } catch (error) {
      toast.error(
        apiErrorMessage(error, "Could not build the report. Please try again."),
      );
    } finally {
      setExporting(null);
      setProgress(0);
    }
  };

  return { download, exporting, progress, isExporting: exporting !== null };
};
