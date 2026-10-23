import { jsPDF } from "jspdf";
import autoTable, { type CellHookData } from "jspdf-autotable";
import type {
  FacilityRankingSummary,
  RankingRowWithMachines,
} from "@/services/apiFacilityRanking";
import type { FacilityResults } from "@/services/apiBookingResults";
import { titleCase } from "@/lib/format";

/**
 * The facility performance report.
 *
 * Written for someone who has not used VEMS: page one says in a sentence what
 * the numbers mean, then shows the totals split the way the work is — SHA
 * bookings, non-SHA studies, equipment — then lists what needs attention. The
 * ranking follows from page two, and the last page explains every column.
 *
 * SHA and non-SHA are never mixed. A SHA booking is work booked and claimed
 * through VEMS; a non-SHA study is a scan that reached VEMS with no booking
 * behind it. Adding them together would describe neither.
 *
 * "Results back" sits beside "Completed" on purpose. On 2026-10-23, 74
 * bookings had a final result back but only 25 were marked completed, so a
 * completion count alone hides most of the delivered work. Where the two
 * disagree, the row says how many are still open.
 *
 * Landscape A4. This module is reached with a dynamic `import()` from the
 * export hook, which keeps jsPDF (~140 kB gzipped) out of the page bundle.
 */

export interface RankingPdfMeta {
  /** Human label for the period filter, e.g. "Last 30 days". */
  period: string;
  county?: string;
  kephLevel?: string;
  /** Human label for the order applied, e.g. "Total bookings". */
  sortBy: string;
  sortOrder: "asc" | "desc";
  generatedAt?: Date;
}

export type ReportRow = RankingRowWithMachines & {
  /** Absent when the facility had no bookings in the period. */
  results?: FacilityResults;
};

const INK = "#0f172a";
const BODY = "#334155";
const MUTED = "#64748b";
const FAINT = "#94a3b8";
const LINE = "#e2e8f0";
const ZEBRA = "#f8fafc";
const SHA = "#185FA5";
const SHA_TINT = "#E6F1FB";
const SHA_TEXT = "#0C447C";
const NON_SHA = "#BA7517";
const NON_SHA_TINT = "#FAEEDA";
const NON_SHA_TEXT = "#633806";
const EQUIP = "#5F5E5A";
const EQUIP_TINT = "#F1EFE8";
const EQUIP_TEXT = "#444441";

const M = 12; // page margin, mm

const count = (value?: number | null) =>
  value == null ? "—" : value.toLocaleString();

/** 0.9% for small shares, 23% for the rest: a whole percent would read 0%. */
const percent = (part: number, whole: number) => {
  if (!whole) return "0%";
  const value = (part / whole) * 100;
  return value > 0 && value < 10
    ? `${value.toFixed(1)}%`
    : `${Math.round(value)}%`;
};

const plural = (n: number, one: string, many: string) =>
  `${n.toLocaleString()} ${n === 1 ? one : many}`;

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

/** "LEVEL 6A" → "Level 6A". */
const kephLabel = (level?: string) => level?.replace(/^level/i, "Level");

const lastY = (doc: jsPDF) =>
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;

/** A labelled figure: small label, large number, optional note under it. */
const figure = (
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  note?: string,
) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(INK);
  doc.text(value, x, y + 6.5);
  if (note) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text(note, x, y + 10.5);
  }
};

/** A panel: a coloured bar over a hairline box, titled. Returns the inner top. */
const panel = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  colour: string,
  textColour: string,
) => {
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
  doc.setFillColor(colour);
  doc.rect(x, y, w, 1.2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(textColour);
  doc.text(title, x + 5, y + 7.5);
  return y + 14;
};

const heading = (doc: jsPDF, text: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(INK);
  doc.text(text, M, y);
  return y + 6;
};

export const buildRankingPdf = (
  rows: ReportRow[],
  summary: FacilityRankingSummary | undefined,
  meta: RankingPdfMeta,
): jsPDF => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const inner = width - M * 2;
  const generated = meta.generatedAt ?? new Date();

  // ── Totals, from the rows so they follow the filters ────────────────────
  const bookings = summary?.total_bookings ?? 0;
  const completed = summary?.completed ?? 0;
  const resultsBack = rows.reduce(
    (n, r) => n + (r.results?.resultsBack ?? 0),
    0,
  );
  const resultsOpen = rows.reduce(
    (n, r) => n + (r.results?.resultsBackOpen ?? 0),
    0,
  );
  const facilitiesWithResults = rows.filter(
    (r) => r.results?.resultsBack,
  ).length;
  const nonSha = summary?.non_sha_studies ?? 0;
  const nonShaFacilities = rows.filter((r) => r.non_sha_studies?.total).length;
  const fleet = rows.reduce(
    (sum, r) => ({
      total: sum.total + (r.machines?.total ?? 0),
      linked: sum.linked + (r.machines?.linked ?? 0),
      live: sum.live + (r.machines?.live ?? 0),
    }),
    { total: 0, linked: 0, live: 0 },
  );
  const noMachineLinked = rows.filter((r) => !r.machines?.linked).length;

  // ── Title ───────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(INK);
  doc.text("Facility performance report", M, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(
    [
      plural(summary?.facilities ?? rows.length, "facility", "facilities"),
      meta.period,
      `County: ${meta.county || "All"}`,
      `KEPH: ${meta.kephLevel || "All"}`,
      `Ranked by ${meta.sortBy.toLowerCase()}`,
    ].join("   ·   "),
    M,
    23.5,
  );
  doc.setFontSize(8);
  doc.setTextColor(FAINT);
  doc.text(
    `Generated ${generated.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    width - M,
    17,
    { align: "right" },
  );
  doc.setDrawColor(SHA);
  doc.setLineWidth(0.7);
  doc.line(M, 27, width - M, 27);

  // ── The headline, in words ──────────────────────────────────────────────
  const headline = [
    resultsBack
      ? `Results came back for ${count(resultsBack)} of ${count(bookings)} SHA bookings (${percent(resultsBack, bookings)}), at ${plural(facilitiesWithResults, "facility", "facilities")}.`
      : `No results came back for any of the ${count(bookings)} SHA bookings in this period.`,
    resultsOpen
      ? `${count(completed)} are marked completed, so ${plural(resultsOpen, "booking has", "bookings have")} a result but ${resultsOpen === 1 ? "is" : "are"} still open.`
      : `${count(completed)} are marked completed.`,
    nonSha
      ? `A further ${count(nonSha)} studies arrived with no SHA booking behind them (non-SHA), at ${plural(nonShaFacilities, "facility", "facilities")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11.5);
  doc.setTextColor(BODY);
  const headlineLines = doc.splitTextToSize(headline, inner);
  doc.text(headlineLines, M, 36, { lineHeightFactor: 1.45 });
  let y = 36 + headlineLines.length * 5.9 + 4;

  // ── Three panels: SHA, non-SHA, equipment ───────────────────────────────
  const panelH = 50;
  const gap = 5;
  const shaW = 150;
  const sideW = (inner - shaW - gap * 2) / 2;

  let top = panel(
    doc,
    M,
    y,
    shaW,
    panelH,
    "SHA  ·  BOOKED THROUGH VEMS",
    SHA,
    SHA_TEXT,
  );
  const col = (shaW - 10) / 3;
  figure(doc, M + 5, top, "Bookings", count(bookings));
  figure(
    doc,
    M + 5 + col,
    top,
    "Results back",
    count(resultsBack),
    `${percent(resultsBack, bookings)} of bookings`,
  );
  figure(
    doc,
    M + 5 + col * 2,
    top,
    "Marked completed",
    count(completed),
    resultsOpen ? `${count(resultsOpen)} with a result still open` : undefined,
  );
  figure(
    doc,
    M + 5,
    top + 17,
    "Claims sent to SHA",
    count(summary?.sha_submitted),
    summary?.sha_submission_rate != null
      ? `${summary.sha_submission_rate}% of bookings`
      : undefined,
  );
  figure(
    doc,
    M + 5 + col,
    top + 17,
    "Claims verified by SHA",
    count(summary?.sha_verified),
    summary?.sha_verification_rate != null
      ? `${summary.sha_verification_rate}% of claims sent`
      : undefined,
  );
  figure(doc, M + 5 + col * 2, top + 17, "Patients", count(summary?.patients));

  const nonShaX = M + shaW + gap;
  top = panel(
    doc,
    nonShaX,
    y,
    sideW,
    panelH,
    "NON-SHA  ·  NO BOOKING",
    NON_SHA,
    NON_SHA_TEXT,
  );
  figure(doc, nonShaX + 5, top, "Studies received", count(nonSha));
  figure(doc, nonShaX + 5, top + 17, "At facilities", count(nonShaFacilities));

  const equipX = nonShaX + sideW + gap;
  top = panel(doc, equipX, y, sideW, panelH, "EQUIPMENT", EQUIP, EQUIP_TEXT);
  figure(
    doc,
    equipX + 5,
    top,
    "Machines linked",
    `${count(fleet.linked)} of ${count(fleet.total)}`,
  );
  figure(doc, equipX + 5, top + 17, "Connected now", count(fleet.live));

  y += panelH + 11;

  // ── What needs attention ────────────────────────────────────────────────
  const attention: string[] = [];
  rows
    .filter((r) => r.results?.resultsBackOpen)
    .sort(
      (a, b) =>
        (b.results?.resultsBackOpen ?? 0) - (a.results?.resultsBackOpen ?? 0),
    )
    .slice(0, 3)
    .forEach((r) =>
      attention.push(
        `${titleCase(r.facility.name)}: ${count(r.results?.resultsBack)} results back, but only ${count(r.results?.completed)} marked completed.`,
      ),
    );
  if (noMachineLinked) {
    attention.push(
      `${plural(noMachineLinked, "facility has", "facilities have")} no machine linked to VEMS, so no result can come back from them.`,
    );
  }
  const linkedSilent = rows.filter(
    (r) => r.machines?.linked && !r.results?.resultsBack,
  ).length;
  if (linkedSilent) {
    attention.push(
      `${plural(linkedSilent, "facility has", "facilities have")} a machine linked but no results back for SHA bookings in this period.`,
    );
  }
  const topNonSha = [...rows].sort(
    (a, b) => (b.non_sha_studies?.total ?? 0) - (a.non_sha_studies?.total ?? 0),
  )[0];
  if (topNonSha?.non_sha_studies?.total) {
    attention.push(
      `${titleCase(topNonSha.facility.name)} sent ${count(topNonSha.non_sha_studies.total)} studies with no SHA booking behind them, the most of any facility.`,
    );
  }
  if (fleet.total && !fleet.live) {
    attention.push("No facility machine is connected to VEMS right now.");
  }

  if (attention.length) {
    y = heading(doc, "What needs attention", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(BODY);
    for (const item of attention) {
      const lines = doc.splitTextToSize(item, inner - 6);
      doc.setFillColor(NON_SHA);
      doc.circle(M + 1.2, y - 1.1, 0.8, "F");
      doc.text(lines, M + 5, y);
      y += lines.length * 4.6 + 1.6;
    }
  }

  // ── The ranking ─────────────────────────────────────────────────────────
  doc.addPage();
  y = heading(doc, `Facilities, ranked by ${meta.sortBy.toLowerCase()}`, 17);

  // What each body cell is, so the hooks can colour it without re-parsing text.
  type Tone = "faint" | "warn" | undefined;
  const tones: Tone[][] = [];

  const body = rows.map((row) => {
    const r = row.results;
    const m = row.machines;
    const place = [
      row.facility.county?.name,
      kephLabel(row.facility.keph_level),
    ]
      .filter(Boolean)
      .join(" · ");
    const back = r?.resultsBack ?? 0;
    const open = r?.resultsBackOpen ?? 0;
    const sent = row.sha?.submitted;
    const verified = row.sha?.verified;
    const studies = row.non_sha_studies?.total ?? 0;

    tones.push([
      undefined,
      undefined,
      row.bookings.total ? undefined : "faint",
      back ? undefined : "faint",
      open ? "warn" : row.bookings.completed ? undefined : "faint",
      sent ? undefined : "faint",
      verified ? undefined : "faint",
      studies ? undefined : "faint",
      m?.linked ? undefined : "faint",
      m?.live ? undefined : "faint",
      m?.lastResultAt ? undefined : "faint",
    ]);

    return [
      String(row.rank),
      place
        ? `${titleCase(row.facility.name)}\n${place}`
        : titleCase(row.facility.name),
      count(row.bookings.total),
      back ? `${count(back)}\n${percent(back, row.bookings.total)}` : "0",
      open
        ? `${count(row.bookings.completed)}\n${count(open)} still open`
        : count(row.bookings.completed),
      sent == null
        ? "—"
        : sent
          ? `${count(sent)}\n${percent(sent, row.bookings.total)}`
          : "0",
      verified == null
        ? "—"
        : verified
          ? `${count(verified)}\n${percent(verified, sent ?? 0)} of sent`
          : "0",
      count(studies),
      m ? `${m.linked} of ${m.total}` : "None",
      m ? String(m.live) : "—",
      !m ? "No machines" : m.lastResultAt ? stamp(m.lastResultAt) : "Never",
    ];
  });

  const group = (
    content: string,
    colSpan: number,
    fill: string,
    text: string,
  ) => ({
    content,
    colSpan,
    styles: {
      fillColor: fill,
      textColor: text,
      halign: "center" as const,
      fontStyle: "bold" as const,
      fontSize: 7,
    },
  });

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: 14, bottom: 14 },
    head: [
      [
        { content: "", colSpan: 2, styles: { fillColor: "#ffffff" } },
        group("SHA  ·  BOOKED THROUGH VEMS", 5, SHA_TINT, SHA_TEXT),
        group("NON-SHA", 1, NON_SHA_TINT, NON_SHA_TEXT),
        group("EQUIPMENT", 3, EQUIP_TINT, EQUIP_TEXT),
      ],
      [
        "#",
        "Facility",
        "Bookings",
        "Results back",
        "Completed",
        "Claims sent",
        "Claims verified",
        "Studies",
        "Machines linked",
        "Live",
        "Last study",
      ],
    ],
    body,
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
      textColor: INK,
      overflow: "linebreak",
      valign: "middle",
      lineColor: LINE,
    },
    headStyles: {
      textColor: MUTED,
      fontStyle: "bold",
      fontSize: 7.5,
      valign: "bottom",
    },
    alternateRowStyles: { fillColor: ZEBRA },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", textColor: MUTED },
      // Top-aligned: the name and its place line fill the cell between
      // them, so the pair still sits in the middle of the row.
      1: { halign: "left", valign: "top" },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 23, halign: "right", fontStyle: "bold" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 25, halign: "right" },
      7: { cellWidth: 18, halign: "right" },
      8: { cellWidth: 23, halign: "right" },
      9: { cellWidth: 12, halign: "right" },
      10: { cellWidth: 24, halign: "right" },
    },
    didParseCell: (data: CellHookData) => {
      if (data.section === "head" && data.row.index === 1) {
        if (data.column.index >= 2) data.cell.styles.halign = "right";
        data.cell.styles.lineWidth = { bottom: 0.4 };
        data.cell.styles.lineColor = FAINT;
      }
      if (data.section !== "body") return;
      data.cell.styles.lineWidth = { bottom: 0.1 };
      const tone = tones[data.row.index]?.[data.column.index];
      if (tone === "faint") data.cell.styles.textColor = FAINT;
      if (tone === "warn") data.cell.styles.textColor = NON_SHA_TEXT;
    },
    // The facility's county and level are a second line in a lighter tone,
    // drawn over the cell's own text: the table only styles whole cells.
    willDrawCell: (data: CellHookData) => {
      if (data.section !== "body" || data.column.index !== 1) return;
      if (data.cell.text.length < 2) return;
      data.cell.text = data.cell.text.slice(0, -1);
    },
    didDrawCell: (data: CellHookData) => {
      if (data.section !== "body" || data.column.index !== 1) return;
      const raw = String(data.cell.raw);
      const split = raw.lastIndexOf("\n");
      if (split < 0) return;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(MUTED);
      // Just under the name's last line: 8.5 pt at the default 1.15 leading
      // is ~3.45 mm a line.
      doc.text(
        raw.slice(split + 1),
        data.cell.x + 2,
        data.cell.y + 2.2 + data.cell.text.length * 3.45 + 2.4,
      );
    },
  });

  // ── How to read this report ─────────────────────────────────────────────
  doc.addPage();
  y = heading(doc, "How to read this report", 17);

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    theme: "plain",
    body: [
      [
        "SHA bookings",
        "Patients booked for a scan through VEMS and claimed from SHA, counted by the date they were booked.",
      ],
      [
        "Results back",
        "Bookings where the scan was done and the study came back to VEMS. This is the clearest sign the service was delivered. The percentage is of the facility's bookings.",
      ],
      [
        "Completed",
        "Bookings the system has marked completed. When this is lower than Results back, the difference is shown as “still open”: the scan was done but the booking was never closed.",
      ],
      [
        "Claims sent",
        "Bookings whose claim was sent to SHA. The percentage is of the facility's bookings.",
      ],
      [
        "Claims verified",
        "Claims SHA has confirmed when a payer asked about them. The percentage is of the claims sent.",
      ],
      [
        "Non-SHA studies",
        "Scans that reached VEMS from a facility's machine with no SHA booking behind them, for example private or walk-in patients.",
      ],
      [
        "Machines linked",
        "Machines in service at the facility that have connected to VEMS at least once, out of all its machines in service.",
      ],
      ["Live", "Machines connected to VEMS at the moment the report was made."],
      [
        "Last study",
        "The most recent study any of the facility's machines sent to VEMS, SHA or not. “Never” means none has.",
      ],
    ],
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      cellPadding: { top: 3, bottom: 3, left: 0, right: 4 },
      textColor: BODY,
      lineColor: LINE,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold", textColor: INK },
    },
    didParseCell: (data: CellHookData) => {
      data.cell.styles.lineWidth = { bottom: 0.1 };
    },
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED);
  doc.text(
    doc.splitTextToSize(
      `Bookings, results, completions, claims and non-SHA studies cover ${meta.period.toLowerCase()}. Machines linked and last study are all time, and Live is the moment the report was made; these leave out decommissioned machines. Machines not yet assigned to a facility appear in no row.`,
      inner,
    ),
    M,
    lastY(doc) + 8,
  );

  // ── Footers, once every page exists ─────────────────────────────────────
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(LINE);
    doc.setLineWidth(0.2);
    doc.line(M, height - 10, width - M, height - 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(FAINT);
    doc.text(
      `VEMS  ·  Facility performance report  ·  ${meta.period}`,
      M,
      height - 6,
    );
    doc.text(`Page ${page} of ${pages}`, width - M, height - 6, {
      align: "right",
    });
  }

  doc.setPage(1);
  return doc;
};

/**
 * `facility-report-results-back-2026-10-23.pdf` — sorts chronologically in a
 * folder, and two orders downloaded the same day do not overwrite each other.
 */
export const rankingPdfFilename = (order: string, at = new Date()): string =>
  `facility-report-${order.replace(/_/g, "-")}-${at.toISOString().slice(0, 10)}.pdf`;
