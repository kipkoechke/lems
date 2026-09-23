import type { Booking, BookingService } from "@/types/booking";

/**
 * Status accessors for booking payloads.
 *
 * `GET /bookings` returns `status` on each service and `finance_approved` on
 * the booking. Older UI code read `service_status`, `booking_status` and
 * `approval_status`, which the API does not send — filters written against
 * those fields match nothing and silently empty the page. These accessors read
 * whatever the deployment actually sends.
 */

/** Machine-readable status of one booked service. */
export const serviceStatus = (service: BookingService): string =>
  service.status ?? service.service_status ?? "";

export const isServiceCompleted = (service: BookingService): boolean =>
  serviceStatus(service) === "completed";

export const isServiceCancelled = (service: BookingService): boolean =>
  serviceStatus(service) === "cancelled";

/** A service still waiting to be delivered. */
export const isServicePending = (service: BookingService): boolean =>
  !isServiceCompleted(service) && !isServiceCancelled(service);

/** Services on this booking still waiting to be delivered. */
export const pendingServiceCount = (booking: Booking): number =>
  booking.pending_count ??
  (booking.services ?? []).filter(isServicePending).length;

export const completedServiceCount = (booking: Booking): number =>
  booking.completed_count ??
  (booking.services ?? []).filter(isServiceCompleted).length;

export const hasPendingServices = (booking: Booking): boolean =>
  pendingServiceCount(booking) > 0;

/** True when every service on the booking is done (and there is at least one). */
export const isFullyCompleted = (booking: Booking): boolean => {
  const services = booking.services ?? [];
  if (services.length === 0) return false;
  return services.every(isServiceCompleted);
};

/**
 * Finance approval state, as the bookings page tabs use it.
 *
 * The API reports this as the `finance_approved` boolean; `approval_status` is
 * only present on deployments that still send it.
 */
export const approvalStatus = (
  booking: Booking,
): "approved" | "pending" | "rejected" => {
  if (booking.approval_status === "rejected") return "rejected";
  if (booking.approval_status === "approved") return "approved";
  if (booking.approval_status === "pending") return "pending";
  return booking.finance_approved ? "approved" : "pending";
};

export const isFinanceApproved = (booking: Booking): boolean =>
  approvalStatus(booking) === "approved";
