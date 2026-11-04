import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { downloadCsv, datedFilename } from "@/lib/csv";
import {
  DELIVERY_LABELS,
  deliveryProgress,
  deliveryState,
  hasQueriedWorklist,
  hasSentResults,
  isShaSubmitted,
  prettifyCode,
  isShaVerified,
  serviceNames,
} from "@/lib/bookingStatus";
import {
  BookingFilters,
  getBookingFilterOptions,
  getBookings,
  getBookingsWithPagination,
} from "@/services/apiBooking";

export function useBookings(filters: BookingFilters = {}) {
  const {
    isPending: isLoading,
    data: bookings = [],
    error,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => getBookings(filters),
  });

  return { isLoading, bookings, error, refetchBookings };
}

export function useBookingsWithPagination(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ["bookings-paginated", filters],
    queryFn: () => getBookingsWithPagination(filters),
    // Keep the current rows on screen while a changed filter loads, so picking
    // a facility doesn't drop the page back to a full-screen skeleton.
    placeholderData: keepPreviousData,
  });
}

/**
 * Downloads every booking the current filters select, as CSV.
 *
 * It pages through the whole filtered set rather than exporting the fifteen
 * rows on screen: a file named for the filters that silently contained one
 * page of them would be read as the whole set and acted on.
 *
 * The readiness columns — results sent, worklist queried — are derived per
 * booking rather than filtered server-side, because `GET /bookings` has no
 * parameter for either. The SHA columns can be narrowed before the download
 * using the page's own SHA filter, which the API does support.
 */
export function useBookingsExport(filters: BookingFilters = {}) {
  const [isExporting, setIsExporting] = useState(false);

  const download = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const rows: unknown[][] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await getBookingsWithPagination({
          ...filters,
          per_page: 100,
          page,
        });
        lastPage = response.pagination?.last_page ?? 1;

        for (const booking of response.data ?? []) {
          rows.push([
            booking.facility?.name ?? "",
            booking.facility?.fr_code ?? "",
            booking.booking_number,
            booking.patient?.name ?? "",
            serviceNames(booking).join("; "),
            booking.source ? prettifyCode(booking.source) : "",
            booking.source_system ? prettifyCode(booking.source_system) : "",
            DELIVERY_LABELS[deliveryState(booking)],
            deliveryProgress(booking),
            hasSentResults(booking) ? "Yes" : "No",
            hasQueriedWorklist(booking) ? "Yes" : "No",
            isShaSubmitted(booking) ? "Yes" : "No",
            isShaVerified(booking) ? "Yes" : "No",
            new Date(booking.created_at).toLocaleDateString("en-GB"),
          ]);
        }

        page += 1;
      } while (page <= lastPage);

      if (!rows.length) {
        toast.error("Nothing to export — no bookings match these filters.");
        return;
      }

      downloadCsv(
        datedFilename("bookings"),
        [
          "Facility",
          "FR Code",
          "Booking #",
          "Patient",
          "Services",
          "Source",
          "Partner System",
          "Status",
          "Services Done",
          "Results Sent",
          "Worklist Queried",
          "SHA Submitted",
          "SHA Verified",
          "Date",
        ],
        rows,
      );
      toast.success(`Exported ${rows.length} bookings`);
    } catch {
      toast.error("Could not build the export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return { download, isExporting };
}

/**
 * The source and partner-system filter lists.
 *
 * Fetched once and held: the lists change when a new HMIS partner is
 * onboarded, not between page views, so re-requesting them on every mount
 * would be a round trip per visit for an answer that is already known. Shared
 * query key, so the two selects and any other consumer resolve to one request.
 */
export function useBookingFilterOptions() {
  const { data, isLoading } = useQuery({
    queryKey: ["booking-filter-options"],
    queryFn: getBookingFilterOptions,
    staleTime: Infinity,
    gcTime: Infinity,
    // An older deployment has no such endpoint; the page must still work, so
    // a failure leaves the lists empty rather than retrying in a loop.
    retry: false,
  });

  return {
    sources: data?.sources ?? [],
    sourceSystems: data?.source_systems ?? [],
    isLoading,
  };
}
