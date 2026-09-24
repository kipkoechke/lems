"use client";

import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaVial,
} from "react-icons/fa";
import type { WorklistTests } from "@/services/apiEquipment";

interface EquipmentWorklistTestsProps {
  tests?: WorklistTests | null;
  /** Rendered in the header, e.g. the MWL Test button, so the two sit together. */
  action?: React.ReactNode;
  className?: string;
}

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/**
 * Equipment testing history.
 *
 * Every equipment detail payload carries this component, so the same table
 * renders in the vendor, facility and admin portals without a second request.
 *
 * A test pushes a probe worklist to the device and waits for the study to come
 * back. `succeeded` is the figure to read: VEMS only learns of a study through
 * the result callback, so a result on the row is proof that the whole
 * C-FIND → acquisition → C-STORE → callback chain worked. A row still
 * `awaiting_result` means the probe went out and nothing has returned — either
 * the device cannot reach VEMS, or nobody has acquired the study yet.
 */
export default function EquipmentWorklistTests({
  tests,
  action,
  className = "",
}: EquipmentWorklistTestsProps) {
  const results = tests?.results ?? [];

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FaVial className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">
            Testing History
          </h2>
          {tests?.last_tested_at && (
            <span className="text-xs text-slate-400">
              last tested {formatDateTime(tests.last_tested_at)}
            </span>
          )}
        </div>
        {action}
      </div>

      {/* Counters cover every test ever run, not just the rows below. */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">Tests Run</p>
          <p className="text-lg font-bold text-slate-900">
            {tests?.total ?? 0}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">Study Returned</p>
          <p className="text-lg font-bold text-emerald-600">
            {tests?.succeeded ?? 0}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">Awaiting Result</p>
          <p className="text-lg font-bold text-amber-600">
            {tests?.awaiting_result ?? 0}
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-slate-500">
            This equipment has never been tested.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            An MWL test pushes a probe worklist to the device and waits for the
            study to come back.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Accession
                </th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Result
                </th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Performed By
                </th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Sent
                </th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Returned
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr
                  key={result.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-xs text-slate-700 break-all">
                      {result.accession_number}
                    </span>
                    {result.study_instance_uid && (
                      <div
                        className="text-[11px] text-slate-400 font-mono truncate max-w-[16rem]"
                        title={result.study_instance_uid}
                      >
                        {result.study_instance_uid}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    {result.succeeded ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <FaCheckCircle className="w-3 h-3" /> Study returned
                      </span>
                    ) : result.awaiting_result ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                        <FaHourglassHalf className="w-3 h-3" /> Awaiting result
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                        <FaTimesCircle className="w-3 h-3" />
                        {result.worklist_status
                          ? result.worklist_status.replace(/_/g, " ")
                          : "No result"}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs text-slate-600 font-mono">
                      {result.performed_by?.ae_title ||
                        result.performed_by_ae_title ||
                        "-"}
                    </span>
                    {result.performed_by?.name && (
                      <div className="text-[11px] text-slate-400">
                        {result.performed_by.name}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">
                    {formatDateTime(result.sent_at ?? result.created_at)}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-500">
                    {formatDateTime(
                      result.result_received_at ?? result.completed_at,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
