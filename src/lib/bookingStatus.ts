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

/**
 * SHA claim state.
 *
 * The two questions are independent, and the API answers them with
 * `sha_submitted` (the booking carries a `claim_id`) and `sha_verified` (SHA
 * answered a payer's query about it). A claim can be submitted and not yet
 * answered, so neither is a step towards the other.
 *
 * Both flags are read with a fallback, because the payload they replace is
 * still what older deployments send: `claim_id` is the evidence `sha_submitted`
 * is derived from, and a verification entry carrying `verified` is what
 * `sha_verified` is derived from. Without the fallback a page filtered on the
 * new flags would empty itself against a deployment that does not send them.
 */

/** True when the claim has been sent to SHA. */
export const isShaSubmitted = (booking: Booking): boolean =>
  booking.sha_submitted ?? !!booking.claim_id;

/**
 * True when SHA answered a payer's query about this claim. A query we could not
 * answer is recorded with `verified` false, so this stays false for a booking
 * nobody has asked about as well as one we could not answer.
 */
export const isShaVerified = (booking: Booking): boolean =>
  booking.sha_verified ??
  (booking.sha_verifications?.history ?? []).some((entry) => entry.verified);

/**
 * Which of the two SHA facts a row should show, if any.
 *
 * `verified` is the stronger statement — SHA has answered for this claim — so
 * it wins when both are true: showing "submitted" beside it would read as
 * though the answer had not arrived.
 */
export const shaClaimState = (
  booking: Booking,
): "verified" | "submitted" | "unsent" =>
  isShaVerified(booking)
    ? "verified"
    : isShaSubmitted(booking)
      ? "submitted"
      : "unsent";

export const SHA_CLAIM_LABELS: Record<
  "verified" | "submitted" | "unsent",
  string
> = {
  verified: "SHA verified",
  submitted: "Submitted",
  unsent: "Not sent",
};
