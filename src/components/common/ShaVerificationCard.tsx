"use client";

import { FaShieldAlt } from "react-icons/fa";
import { LatestTime } from "./LatestTime";
import type { ShaVerificationSummary } from "@/services/apiDashboard";

interface ShaVerificationCardProps {
  summary?: ShaVerificationSummary | null;
  className?: string;
}

/**
 * SHA verifications — the payer queries against a claim, and who answered.
 *
 * A verification is one payer asking whether a claim is ours and what it is
 * worth. The card separates the two ways we can answer: VEMS already holds the
 * booking, or NESP Link does and had to be asked. A query neither side knows is
 * counted rather than left as the remainder of a subtraction, because that is
 * the number that points at a data gap.
 *
 * Renders nothing until the API that counts these is deployed, rather than
 * showing a row of zeroes that would read as "nobody is asking".
 */
export const ShaVerificationCard: React.FC<ShaVerificationCardProps> = ({
  summary,
  className = "",
}) => {
  if (!summary) return null;

  const { total, verified, unverified, success_rate: successRate } = summary;

  const figures = [
    {
      label: "VEMS",
      value: summary.from_vems,
      cls: "text-blue-600",
      hint: "Answered from our own booking records",
    },
    {
      label: "NESP",
      value: summary.from_nesp,
      cls: "text-violet-600",
      hint: "Answered by NESP Link, which holds the claims VEMS does not",
    },
    {
      label: "Not found",
      value: unverified,
      cls: "text-amber-600",
      hint: "Neither side knew this claim — the question is kept for the dispute",
    },
  ];

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <FaShieldAlt className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          SHA Verifications
        </p>
        <span className="ml-auto text-xs text-slate-400">
          {total.toLocaleString()} asked
        </span>
      </div>

      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-slate-900">
          {verified.toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 pb-1">
          of {total.toLocaleString()} answered
          {total > 0 && ` · ${successRate}%`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {figures.map((figure) => (
          <div
            key={figure.label}
            title={figure.hint}
            className="rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <p className={`text-xl font-bold ${figure.cls}`}>
              {figure.value.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">{figure.label}</p>
          </div>
        ))}
      </div>
      <LatestTime label="Latest verification" value={summary.latest_at} />
    </div>
  );
};

export default ShaVerificationCard;
