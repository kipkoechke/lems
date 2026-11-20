"use client";

import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

interface VerificationBadgeProps {
  verified: boolean;
  /** Tighter form for table rows and phone cards. */
  compact?: boolean;
  className?: string;
}

/**
 * Whether a vendor user has confirmed an equipment record matches the machine.
 *
 * Unverified is deliberately neutral rather than a warning colour: it means
 * nobody has got round to confirming it yet, which is the starting state of
 * every record and not a fault. Amber here would paint a whole new fleet red
 * on day one.
 */
export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verified,
  compact = false,
  className = "",
}) => (
  <span
    title={
      verified
        ? "A vendor user has confirmed this record matches the machine on site"
        : "No vendor user has confirmed this record yet"
    }
    className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
      compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
    } ${
      verified
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-50 text-slate-600 border-slate-200"
    } ${className}`}
  >
    {verified ? (
      <FaCheckCircle className="w-3 h-3" />
    ) : (
      <FaRegCircle className="w-3 h-3" />
    )}
    {verified ? "Verified" : "Unverified"}
  </span>
);
