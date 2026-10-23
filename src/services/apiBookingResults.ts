import { getBookingsWithPagination } from "./apiBooking";
import { hasSentResults } from "@/lib/bookingStatus";
import type { Booking } from "@/types/booking";

/**
 * What each facility's SHA bookings actually produced: how many had a study
 * come back, and how many of those the system has marked completed.
 *
 * Neither the ranking API nor any summary reports results per booking, so
 * this walks the bookings list itself. It is the only place the two facts can
 * be put side by side, and the gap between them is the point: on 2026-10-23,
 * 74 bookings had a final result back but only 25 were marked completed.
 *
 * A full walk is ~85 pages of 100 (the API's maximum) at ~2 s each, so pages
 * are fetched a few at a time and progress is reported to the caller.
 */

export interface FacilityResults {
  /** SHA bookings at the facility in the period. */
  bookings: number;
  /** Bookings with at least one study returned for them. */
  resultsBack: number;
  /** Bookings the system has marked completed. */
  completed: number;
  /** Results back on a booking still not marked completed. */
  resultsBackOpen: number;
  /** The most recent study received for one of its bookings. */
  lastResultAt: string | null;
}

// Each page is a heavy query on the production API. Four at a time took
// ~40 s for a full walk when the API was quiet; more would speed it little
// and weigh on everyone else using it.
const CONCURRENCY = 4;

const lastReceived = (booking: Booking): string | null =>
  (booking.services ?? [])
    .map((service) => service.result?.received_at)
    .filter((value): value is string => !!value)
    .sort()
    .at(-1) ?? null;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The ranking's period presets as the bookings list's `from` / `to` dates.
 * An unknown or empty period is all time.
 */
export const periodRange = (
  period: string | undefined,
  now = new Date(),
): { from?: string; to?: string } => {
  const start = new Date(now);
  switch (period) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "12m":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "this_month":
      start.setDate(1);
      break;
    case "this_year":
      start.setMonth(0, 1);
      break;
    default:
      return {};
  }
  return { from: isoDate(start), to: isoDate(now) };
};

/** Every facility's results facts for the period, keyed by facility id. */
export const getBookingResultsByFacility = async (
  period: string | undefined,
  onProgress?: (done: number, total: number) => void,
): Promise<Record<string, FacilityResults>> => {
  const range = periodRange(period);
  const results: Record<string, FacilityResults> = {};

  const tally = (bookings: Booking[]) => {
    for (const booking of bookings) {
      const id = booking.facility?.id;
      if (!id) continue;
      const facts = (results[id] ??= {
        bookings: 0,
        resultsBack: 0,
        completed: 0,
        resultsBackOpen: 0,
        lastResultAt: null,
      });
      facts.bookings += 1;
      const done = booking.status === "completed";
      if (done) facts.completed += 1;
      if (hasSentResults(booking)) {
        facts.resultsBack += 1;
        if (!done) facts.resultsBackOpen += 1;
        const at = lastReceived(booking);
        if (at && (!facts.lastResultAt || at > facts.lastResultAt)) {
          facts.lastResultAt = at;
        }
      }
    }
  };

  const fetchPage = (page: number) =>
    getBookingsWithPagination({ ...range, per_page: 100, page });

  const first = await fetchPage(1);
  tally(first.data ?? []);
  const lastPage = first.pagination?.last_page ?? 1;
  let done = 1;
  onProgress?.(done, lastPage);

  for (let page = 2; page <= lastPage; page += CONCURRENCY) {
    const batch = await Promise.all(
      Array.from(
        { length: Math.min(CONCURRENCY, lastPage - page + 1) },
        (_, offset) => fetchPage(page + offset),
      ),
    );
    for (const response of batch) tally(response.data ?? []);
    done += batch.length;
    onProgress?.(done, lastPage);
  }

  return results;
};
