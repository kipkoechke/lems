"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  PayerReferenceType,
  PayerValidationResult,
  PAYER_REFERENCE_TYPES,
  validatePayerServices,
} from "@/services/apiPayer";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";
import { FaClipboardCheck, FaSearch } from "react-icons/fa";

const formatCurrency = (value?: number | null) =>
  value === undefined || value === null
    ? "-"
    : `KES ${Number(value).toLocaleString()}`;

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

function PayerValidateContent() {
  const [referenceType, setReferenceType] =
    useState<PayerReferenceType>("booking_reference");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [result, setResult] = useState<PayerValidationResult | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => validatePayerServices(referenceType, referenceNumber),
    onSuccess: (data) => setResult(data),
  });

  // A miss comes back as HTTP 200 with code "404" — treat it as "not found",
  // not as a successful validation.
  const notFound = !!result?.code && result.code === "404";
  const found = !!result && !notFound;

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaClipboardCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Payer Validation
              </h1>
              <p className="text-sm text-slate-500">
                Validate services against a booking reference or claim ID
              </p>
            </div>
          </div>
        </div>

        {/* Lookup */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (referenceNumber.trim()) mutate();
            }}
            className="flex flex-col sm:flex-row gap-3 sm:items-end"
          >
            <div className="w-full sm:w-56">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reference Type <span className="text-red-500">*</span>
              </label>
              <select
                value={referenceType}
                onChange={(e) =>
                  setReferenceType(e.target.value as PayerReferenceType)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {PAYER_REFERENCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={
                  referenceType === "booking_reference"
                    ? "e.g. BK-2025-00042"
                    : "Claim UUID"
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !referenceNumber.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FaSearch className="w-3.5 h-3.5" />
              {isPending ? "Validating..." : "Validate"}
            </button>
          </form>
        </div>

        {error && (
          <ErrorState title="Validation Request Failed" error={error} />
        )}

        {notFound && (
          <div className="bg-white rounded-lg border border-amber-200 p-8 text-center">
            <p className="text-sm font-medium text-amber-800">
              {result?.message || "Booking not found."}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {result?.reference_type} · {result?.reference_number}
            </p>
          </div>
        )}

        {found && (
          <>
            {/* Booking / patient / facility */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                {[
                  { label: "Booking Number", value: result?.booking?.booking_number },
                  { label: "Claim ID", value: result?.booking?.claim_id },
                  { label: "Source", value: result?.booking?.source },
                  { label: "Status", value: result?.booking?.status },
                  { label: "Patient", value: result?.patient?.name },
                  { label: "CR No", value: result?.patient?.cr_no },
                  {
                    label: "Identification",
                    value: result?.patient?.identification_no,
                  },
                  { label: "Phone", value: result?.patient?.phone },
                  { label: "Facility", value: result?.facility?.name },
                  { label: "FR Code", value: result?.facility?.fr_code },
                  { label: "County", value: result?.facility?.county },
                  {
                    label: "SHA Contract",
                    value: result?.facility?.sha_contract_status,
                  },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="text-xs text-slate-500">{d.label}</p>
                    <p className="text-sm font-medium text-slate-900 break-words capitalize">
                      {d.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Created: {formatDateTime(result?.booking?.created_at)}</span>
                <span>
                  Completed: {formatDateTime(result?.booking?.completed_at)}
                </span>
              </div>
            </div>

            {/* Financial summary */}
            {result?.financial_summary && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  {
                    label: "Total Tariff",
                    value: formatCurrency(result.financial_summary.total_tariff),
                  },
                  {
                    label: "SHA",
                    value: formatCurrency(result.financial_summary.total_sha),
                  },
                  {
                    label: "Cash",
                    value: formatCurrency(result.financial_summary.total_cash),
                  },
                  {
                    label: "Other Insurance",
                    value: formatCurrency(
                      result.financial_summary.other_insurance,
                    ),
                  },
                  {
                    label: "Eligibility",
                    value: result.financial_summary.eligibility_verified
                      ? "Verified"
                      : "Not verified",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-lg border border-slate-200 p-3"
                  >
                    <p className="text-xs text-gray-600">{s.label}</p>
                    <p className="text-base font-bold text-slate-900 mt-0.5">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Services */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Services ({result?.services?.length ?? 0})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Service</Table.HeaderCell>
                      <Table.HeaderCell>Equipment</Table.HeaderCell>
                      <Table.HeaderCell>Vendor</Table.HeaderCell>
                      <Table.HeaderCell>Tariff</Table.HeaderCell>
                      <Table.HeaderCell>SHA</Table.HeaderCell>
                      <Table.HeaderCell>Vendor Share</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {!result?.services?.length ? (
                      <Table.Empty colSpan={7}>
                        No services on this booking.
                      </Table.Empty>
                    ) : (
                      result.services.map((s) => (
                        <Table.Row key={s.id}>
                          <Table.Cell>
                            <div className="font-medium text-slate-900">
                              {s.service.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {s.service.code}
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-700">
                              {s.equipment?.name || "-"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-700">
                              {s.vendor?.name || "-"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-900">
                              {formatCurrency(s.cost?.tariff)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-900">
                              {formatCurrency(s.cost?.sha)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm font-medium text-slate-900">
                              {formatCurrency(s.cost?.vendor_share)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                              {s.service.status?.replace(/_/g, " ") || "-"}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PayerValidatePage() {
  return (
    <PermissionGate permission={Permission.VALIDATE_PAYER_SERVICES}>
      <PayerValidateContent />
    </PermissionGate>
  );
}
