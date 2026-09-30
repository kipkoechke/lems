/**
 * CSV downloads.
 *
 * CSV rather than a spreadsheet format: it opens in Excel, Sheets and Numbers
 * without a library, and these exports are flat tables with no formatting to
 * lose.
 */

/**
 * One cell.
 *
 * Every value is quoted rather than only the ones that need it — a facility
 * name containing a comma is common enough that the conditional version is
 * just a way to be wrong occasionally. Embedded quotes double, per RFC 4180.
 */
const cell = (value: unknown): string => {
  if (value == null) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
};

export const toCsv = (headers: string[], rows: unknown[][]): string =>
  [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");

/**
 * Hands the browser a CSV file.
 *
 * The UTF-8 BOM is deliberate: without it Excel on Windows reads the file as
 * the local codepage, and facility names lose any character outside it.
 */
export const downloadCsv = (
  filename: string,
  headers: string[],
  rows: unknown[][],
): void => {
  const blob = new Blob(["﻿", toCsv(headers, rows)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

/** `equipment-status-2026-09-30.csv` — sorts chronologically in a folder. */
export const datedFilename = (stem: string): string =>
  `${stem}-${new Date().toISOString().slice(0, 10)}.csv`;
