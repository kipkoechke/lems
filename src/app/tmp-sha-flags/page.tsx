"use client";

import { ShaClaimBadges, ShaClaimChip } from "@/components/common/ShaClaimBadges";
import { shaClaimState } from "@/lib/bookingStatus";
import type { Booking } from "@/types/booking";

// TEMPORARY harness for the SHA claim flags. Deleted after review.

const base = {
  id: "b", booking_number: "VB202610050104",
  patient: { id: "p", name: "X", phone: "+254700000000", identification_no: "1", sha_number: null, date_of_birth: null, gender: null },
  facility: { id: "f", name: "F", fr_code: "FID-1" },
  status: "completed", services: [], created_at: "2026-10-05T00:00:00+00:00",
  created_by: null,
} as unknown as Booking;

const cases: { name: string; booking: Booking }[] = [
  { name: "flags: submitted + verified", booking: { ...base, sha_submitted: true, sha_verified: true } },
  { name: "flags: submitted only", booking: { ...base, sha_submitted: true, sha_verified: false } },
  { name: "flags: verified only (not submitted)", booking: { ...base, sha_submitted: false, sha_verified: true } },
  { name: "flags: neither", booking: { ...base, sha_submitted: false, sha_verified: false } },
  {
    name: "legacy: no flags, claim_id only",
    booking: { ...base, claim_id: "f4e7e380-4166-437e-aa9e-3b550bb593a4" },
  },
  {
    name: "legacy: no flags, verified history",
    booking: {
      ...base,
      sha_verifications: { count: 1, last_queried_at: null, history: [{ id: "h", queried_at: "2026-10-05T00:00:00+00:00", verified: true, source: "provider", reference_type: "claim_id", reference_number: "r", asked_by: "Payer", tariff: 0, sha: 0, vendor_share: 0, facility_share: 0, services: [] }] },
    },
  },
  {
    name: "legacy: no flags, unverified history only",
    booking: {
      ...base,
      claim_id: "abc",
      sha_verifications: { count: 1, last_queried_at: null, history: [{ id: "h", queried_at: "2026-10-05T00:00:00+00:00", verified: false, source: "provider", reference_type: "claim_id", reference_number: "r", asked_by: "Payer", tariff: 0, sha: 0, vendor_share: 0, facility_share: 0, services: [] }] },
    },
  },
];

export default function Harness() {
  return (
    <div className="min-h-screen p-6 bg-slate-50 space-y-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          List row chip
        </p>
        <ul className="space-y-2">
          {cases.map(({ name, booking }) => (
            <li key={name} data-chip-case={name} className="flex items-center gap-3 text-xs">
              <span className="w-64 text-slate-500">{name}</span>
              <span className="w-20 font-mono text-[10px] text-slate-400">
                {shaClaimState(booking)}
              </span>
              <ShaClaimChip booking={booking} />
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Detail header badges
        </p>
        <ul className="space-y-3">
          {cases.map(({ name, booking }) => (
            <li key={name} data-case={name} className="text-xs">
              <span className="block text-slate-500 mb-1">{name}</span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Completed
                </span>
                <ShaClaimBadges booking={booking} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
