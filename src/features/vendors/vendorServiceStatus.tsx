import type { VendorBookingItem } from "@/types/booking";

/**
 * A booked service as a vendor reads it: delivered or not.
 *
 * The vendor bookings list sends one row per booked service, with the
 * service's own status. The booking's status beside it is a lifecycle flag
 * (`active` until every service is done), so it is not shown: "active" over
 * "Not started" read as two answers to one question.
 */
export const VENDOR_SERVICE_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  not_started: {
    label: "Not started",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  in_progress: {
    label: "In progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function VendorServiceStatus({ status }: { status: string }) {
  const style =
    VENDOR_SERVICE_STATUS[status] ?? VENDOR_SERVICE_STATUS.not_started;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export const isDelivered = (item: VendorBookingItem) =>
  item.status === "completed";

export const isAwaitingDelivery = (item: VendorBookingItem) =>
  item.status === "not_started" || item.status === "in_progress";

/** Sum of the vendor's share over these services. */
export const shareOf = (items: VendorBookingItem[]) =>
  items.reduce((total, item) => total + (Number(item.vendor_share) || 0), 0);

export const serviceDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
