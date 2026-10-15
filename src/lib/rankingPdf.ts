import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  FacilityRankingSummary,
  RankingRow,
} from "@/services/apiFacilityRanking";

/**
 * The facility ranking as a PDF.
 *
 * A report rather than a dump of the table: it opens with what the reader
 * needs to trust the numbers — which filters produced this set, how many
 * facilities are in it, when it was generated — then the totals, then the
 * ranking itself. A ranking read without its filter context is a ranking of
 * something else, so the period, county and KEPH actually applied are printed
 * at the top rather than left to memory.
 *
 * Landscape A4, because the ranking is a wide table: portrait would either
 * drop the claim counts or wrap every facility name onto three lines.
 *
 * This module is reached with a dynamic `import()` from the export hook, which
 * keeps jsPDF in its own chunk (~443 kB raw, ~140 kB gzipped) rather than in
 * the page bundle. The build does still preload that chunk for this route, so
 * moving it into a worker is the next step if the page weight matters.
 */

export interface RankingPdfMeta {
  /** Human label for the period filter, e.g. "Last 30 days". */
  period: string;
  county?: string;
  kephLevel?: string;
  /** Human label for the sort applied, e.g. "Total bookings". */
  sortBy: string;
  sortOrder: "asc" | "desc";
  generatedAt?: Date;
}

const SLATE_900 = "#0f172a";
const SLATE_500 = "#64748b";
const SLATE_400 = "#94a3b8";
const AMBER_500 = "#f59e0b";
const HEAD_FILL = "#f1f5f9";
const ZEBRA_FILL = "#f8fafc";

const count = (value?: number | null) =>
  value == null ? "—" : value.toLocaleString();

const stamp = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

/** `1,285 (23.2%)` — the rate belongs beside its count, not in a bare cell. */
const withRate = (value?: number | null, rate?: number | null) =>
  value == null ? "—" : `${value.toLocaleString()} (${rate ?? 0}%)`;

/** Section heading: a small tracked label over a hairline. */
const section = (doc: jsPDF, label: string, y: number): number => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(SLATE_500);
  doc.text(label.toUpperCase(), 10, y);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(10, y + 1.5, doc.internal.pageSize.getWidth() - 10, y + 1.5);
  return y + 6;
};

export const buildRankingPdf = (
  rows: RankingRow[],
  summary: FacilityRankingSummary | undefined,
  meta: RankingPdfMeta,
): jsPDF => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const generated = meta.generatedAt ?? new Date();

  // ── Title block ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(SLATE_900);
  doc.text("Facility Ranking", 10, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(SLATE_500);
  doc.text(
    `${count(summary?.facilities ?? rows.length)} facilities, ranked by ${meta.sortBy.toLowerCase()}`,
    10,
    22,
  );

  doc.setFontSize(8.5);
  doc.setTextColor(SLATE_400);
  doc.text(
    `Generated ${generated.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    width - 10,
    16,
    { align: "right" },
  );

  doc.setDrawColor(AMBER_500);
  doc.setLineWidth(0.8);
  doc.line(10, 25.5, width - 10, 25.5);

  // ── What this report covers ─────────────────────────────────────────────
  const context = [
    `Period: ${meta.period}`,
    `County: ${meta.county || "All"}`,
    `KEPH level: ${meta.kephLevel || "All"}`,
    `Order: ${meta.sortBy}, ${meta.sortOrder === "asc" ? "ascending" : "descending"}`,
  ].join("   ·   ");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(SLATE_500);
  doc.text(context, 10, 31);

  // ── Totals ──────────────────────────────────────────────────────────────
  let cursor = section(doc, "Summary", 38);

  autoTable(doc, {
    startY: cursor,
    theme: "plain",
    // Pinned to the same 10 mm the title and footer use, so the column widths
    // below are measured against a known page width rather than the plugin's
    // own default.
    margin: { left: 10, right: 10 },
    // Two label/value pairs per row: the whole block stays on one screen-worth
    // of paper instead of running down the page.
    body: [
      [
        {
          content: "Facilities",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        count(summary?.facilities ?? rows.length),
        {
          content: "Patients",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        count(summary?.patients),
      ],
      [
        {
          content: "Bookings",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        count(summary?.total_bookings),
        {
          content: "Completion rate",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        `${summary?.completion_rate ?? 0}%`,
      ],
      [
        {
          content: "Completed",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        count(summary?.completed),
        {
          content: "Cancelled",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        count(summary?.cancelled),
      ],
      [
        {
          content: "Claims submitted",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        withRate(summary?.sha_submitted, summary?.sha_submission_rate),
        {
          content: "Claims verified",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        withRate(summary?.sha_verified, summary?.sha_verification_rate),
      ],
      [
        {
          content: "Non-SHA studies",
          styles: { fontStyle: "bold", textColor: SLATE_900 },
        },
        count(summary?.non_sha_studies),
        "",
        "",
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 1.2, bottom: 1.2, left: 0, right: 2 },
      textColor: SLATE_500,
    },
    // No fixed widths here: the plugin spreads the four columns across the
    // page. Pinning them narrower leaves a wide empty margin that reads as a
    // mistake, and pinning them wider clips.
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "left" },
    },
  });

  cursor = section(
    doc,
    "Ranking",
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 11,
  );

  // ── The ranking ─────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: cursor,
    margin: { left: 10, right: 10 },
    head: [
      [
        "#",
        "Facility",
        "County / KEPH",
        "Bookings",
        "Completion",
        "Patients",
        "Claims submitted",
        "Claims verified",
        "Non-SHA",
        "Last booking",
      ],
    ],
    body: rows.map((row) => [
      String(row.rank),
      // The FR code identifies the facility on every other screen, so it
      // travels with the name rather than in a column of its own.
      row.facility.fr_code
        ? `${row.facility.name}\n${row.facility.fr_code}`
        : row.facility.name,
      [row.facility.county?.name, row.facility.keph_level]
        .filter(Boolean)
        .join("\n"),
      `${row.bookings.total.toLocaleString()}\n${row.bookings.pending.toLocaleString()} pending`,
      `${row.bookings.completion_rate}%`,
      row.bookings.patients.toLocaleString(),
      row.sha ? row.sha.submitted.toLocaleString() : "—",
      row.sha
        ? `${row.sha.verified.toLocaleString()}\n${row.sha.verification_rate}% of sent`
        : "—",
      row.non_sha_studies?.total ? String(row.non_sha_studies.total) : "0",
      stamp(row.bookings.last_booking_at),
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 1.6,
      textColor: SLATE_900,
      lineColor: "#e2e8f0",
      lineWidth: 0.1,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: HEAD_FILL,
      textColor: SLATE_500,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
    },
    alternateRowStyles: { fillColor: ZEBRA_FILL },
    // Only the narrow numeric columns are pinned; the rest share what is left,
    // so the table spans the page instead of leaving a wide empty margin.
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      4: { cellWidth: 20, halign: "right" },
      5: { cellWidth: 18, halign: "right" },
      8: { cellWidth: 16, halign: "right" },
      9: { cellWidth: 24, halign: "right" },
      1: { halign: "left" },
      2: { halign: "left" },
      3: { halign: "right" },
      6: { halign: "right" },
      7: { halign: "right" },
    },
    // The header repeats by default, which matters on a report that runs to
    // several pages: a table of numbers with no headings is unreadable.
    didDrawPage: () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(SLATE_400);
      doc.text("Facility Ranking", 10, doc.internal.pageSize.getHeight() - 6);
    },
  });

  // The per-page total is only known once every page exists, so the footers are
  // written in a second pass. Writing "Page 1" during the draw and correcting it
  // afterwards would print both.
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(SLATE_400);
    doc.text(
      `Page ${page} of ${pages}`,
      doc.internal.pageSize.getWidth() - 10,
      doc.internal.pageSize.getHeight() - 6,
      { align: "right" },
    );
  }

  doc.setPage(1);
  return doc;
};

/** `facility-ranking-2026-10-15.pdf` — sorts chronologically in a folder. */
export const rankingPdfFilename = (at = new Date()): string =>
  `facility-ranking-${at.toISOString().slice(0, 10)}.pdf`;
