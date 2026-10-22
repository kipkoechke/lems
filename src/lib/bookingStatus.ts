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
  // Both name SHA. The chip sits under the booking's own status badge, where
  // an unqualified "Submitted" or "Not sent" reads as a second opinion on the
  // booking — "Completed / Not sent" looks like a contradiction rather than
  // two facts about different things.
  submitted: "SHA submitted",
  unsent: "SHA not sent",
};

/**
 * The service names on a booking, in the order the API lists them.
 *
 * Two payloads reach the listings: the nested one (`services[].service.name`)
 * and the flat one older deployments send (`booked_services[].name`). A list
 * row that reads only one of them renders blank against the other, so both are
 * read here rather than in each page.
 */
export const serviceNames = (booking: Booking): string[] => {
  const nested = (booking.services ?? [])
    .map((service) => service.service?.name ?? service.name)
    .filter((name): name is string => !!name);

  if (nested.length) return nested;

  return (booking.booked_services ?? [])
    .map((service) => service.name)
    .filter((name): name is string => !!name);
};

/**
 * Delivery state — whether the work actually happened.
 *
 * The API's own `status` is a lifecycle flag: `active` means the booking is
 * open, which it stays from the moment OTP clears until the last service is
 * delivered. On a list that is close to useless — nearly every row says
 * "Active" and none of them says whether anything has been done. The counts
 * the list API already sends answer the question that is actually being asked,
 * so the badge is derived from them and `status` is consulted only for the
 * states no count can express.
 */
export type DeliveryState =
  | "completed"
  | "not_completed"
  | "cancelled"
  | "pending_otp";

export const deliveryState = (booking: Booking): DeliveryState => {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.status === "pending_otp") return "pending_otp";
  if (booking.status === "completed") return "completed";

  const total = booking.services_count ?? (booking.services ?? []).length;
  const done = completedServiceCount(booking);

  // Two states, not three. "Not started" and "In progress" split a group that
  // nobody acts on differently — the question this list is scanned for is
  // whether the work is done. A booking with no services recorded is not
  // "completed" by vacuous truth.
  return total > 0 && done >= total ? "completed" : "not_completed";
};

export const DELIVERY_LABELS: Record<DeliveryState, string> = {
  completed: "Completed",
  not_completed: "Not completed",
  cancelled: "Cancelled",
  pending_otp: "Pending OTP",
};

export const DELIVERY_BADGES: Record<DeliveryState, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_completed: "bg-slate-50 text-slate-600 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending_otp: "bg-amber-50 text-amber-700 border-amber-200",
};

/**
 * `"2/3"`, or `""` when the booking lists no services to count.
 *
 * The export uses this; the table does not. On screen the fraction sat beside
 * the badge reading "0/1" on nearly every row, which is the badge restated as
 * arithmetic. In a spreadsheet the same number is worth having, because it can
 * be summed.
 */
export const deliveryProgress = (booking: Booking): string => {
  const total = booking.services_count ?? (booking.services ?? []).length;
  if (!total) return "";
  return `${completedServiceCount(booking)}/${total}`;
};

/** Every service on the booking, whichever payload shape carried it. */
const resultsOf = (booking: Booking) =>
  (booking.services ?? []).map((service) => service.result).filter(Boolean);

/**
 * A study came back for at least one service on this booking.
 *
 * Evidence, not configuration: a result row exists with a status or a
 * received timestamp, which only happens once the modality sent something.
 */
export const hasSentResults = (booking: Booking): boolean =>
  resultsOf(booking).some((result) => !!result?.result_status || !!result?.received_at);

/**
 * The modality queried the worklist for at least one service on this booking.
 * `worklist_status` is only ever written when a C-FIND was actually logged.
 */
export const hasQueriedWorklist = (booking: Booking): boolean =>
  resultsOf(booking).some((result) => !!result?.worklist_status);
