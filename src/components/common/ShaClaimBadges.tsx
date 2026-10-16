"use client";

import { MdFactCheck, MdSend } from "react-icons/md";
import {
  isShaSubmitted,
  isShaVerified,
  shaClaimState,
  SHA_CLAIM_LABELS,
} from "@/lib/bookingStatus";
import type { Booking } from "@/types/booking";

/**
 * How a booking's SHA claim state is shown.
 *
 * Two facts, from `sha_submitted` and `sha_verified`: whether the claim was
 * sent to SHA, and whether SHA has answered a payer's query about it. They are
 * independent — a claim can be sent and not yet answered — so the list and the
 * detail row present them differently on purpose:
 *
 * - `ShaClaimChip` is the collapsed form for a table row, where there is room
 *   for one statement. "SHA verified" wins over "Submitted" when both hold,
 *   because a claim SHA has answered for has plainly also been sent.
 * - `ShaClaimBadges` is the full form for a detail header, where both can be
 *   said at once.
 *
 * "Not sent" is rendered rather than left blank: the claims that have not gone
 * to SHA are the ones either view is scanned for.
 */

const CHIP_BADGE: Record<"verified" | "submitted" | "unsent", string> = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  unsent: "bg-slate-50 text-slate-500 border-slate-200",
};

const CHIP_HINT: Record<"verified" | "submitted" | "unsent", string> = {
  verified: "SHA answered a payer's query about this claim",
  submitted:
    "The claim has been sent to SHA — no query has been answered for it yet",
  unsent:
    "No claim id on this booking, so no claim has been sent to SHA yet. This " +
    "says nothing about whether the service itself was performed.",
};

/** One row's SHA claim state, collapsed to the strongest statement. */
export const ShaClaimChip = ({ booking }: { booking: Booking }) => {
  const state = shaClaimState(booking);

  return (
    <span
      title={CHIP_HINT[state]}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${CHIP_BADGE[state]}`}
    >
      {SHA_CLAIM_LABELS[state]}
    </span>
  );
};

/**
 * Both SHA claim facts, for a header that has room for them.
 *
 * The claim id outlives the claim's status, and a verification is recorded
 * whether or not we could answer it — so these two say what has actually
 * happened, next to a `sha_status` that says where the claim stands now.
 */
export const ShaClaimBadges = ({ booking }: { booking: Booking }) => (
  <>
    {isShaSubmitted(booking) && (
      <span
        title="This booking carries a claim id — the claim has been sent to SHA"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-violet-50 text-violet-700 border-violet-200"
      >
        <MdSend className="w-3 h-3" /> Claim Submitted
      </span>
    )}
    {isShaVerified(booking) && (
      <span
        title="SHA answered a payer's query about this booking's claim"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200"
      >
        <MdFactCheck className="w-3 h-3" /> SHA Verified
      </span>
    )}
  </>
);
