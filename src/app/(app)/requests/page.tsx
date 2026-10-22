"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMedicalRequests } from "@/features/requests/useRequests";
import { VendorFilter } from "@/components/common/VendorFilter";
import { KephLevelFilter } from "@/components/common/KephLevelFilter";
import { PERIOD_PRESETS } from "@/services/apiPingRequests";
import {
  REQUEST_STATUS_OPTIONS,
  requestFacility,
  requestIdentifier,
  requestLabel,
  requestPatientName,
  requestProcedure,
} from "@/services/apiRequests";
import { equipmentDeviceName } from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { ErrorState } from "@/components/common/ErrorState";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FaFileMedical } from "react-icons/fa";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  acknowledged: "bg-indigo-50 text-indigo-700 border-indigo-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-50 text-slate-700 border-slate-200",
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
        STATUS_BADGE[status] ?? "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {String(status).replace(/_/g, " ")}
    </span>
  );
}

function RequestsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [patient, setPatient] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [kephLevel, setKephLevel] = useState("");
  const [period, setPeriod] = useState("");

  const { requests, pagination, isLoading, error, refetch } =
    useMedicalRequests({
      page,
      page_size: 20,
      status: status || undefined,
      patient: patient || undefined,
      // The vendor of the named machine, or of the contract when the order
      // names only a facility.
      vendor_id: vendorId || undefined,
      keph_level: kephLevel || undefined,
      period: period || undefined,
    });

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Medical Requests"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 mb-2 md:mb-3 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaFileMedical className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Medical Requests
                </h1>
                <p className="text-sm text-slate-500">
                  {pagination?.total ?? requests.length} EMR imaging orders
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={patient}
                onChange={(v) => {
                  setPatient(v);
                  setPage(1);
                }}
                placeholder="Search by patient name..."
              />
            </div>

            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3">
              <KephLevelFilter
                value={kephLevel}
                onChange={(value) => {
                  setKephLevel(value);
                  setPage(1);
                }}
                className="shrink-0 w-full lg:w-40"
              />

              <div className="w-full lg:w-56 shrink-0">
                <VendorFilter
                  value={vendorId}
                  onChange={(id) => {
                    setVendorId(id);
                    setPage(1);
                  }}
                  hideLabel
                />
              </div>

              <SearchableSelect
                label=""
                compact
                className="shrink-0 w-full lg:w-44"
                value={period}
                onChange={(value) => {
                  setPeriod(value);
                  setPage(1);
                }}
                placeholder="All time"
                options={PERIOD_PRESETS}
              />

              {/* Status filters from its column header on a desktop; a phone
                  has no headers, so it joins the others here. */}
              <SearchableSelect
                label=""
                compact
                className="md:hidden w-full"
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                placeholder="All Status"
                options={REQUEST_STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="hidden md:block">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Request ID</Table.HeaderCell>
                  <Table.HeaderCell>Patient</Table.HeaderCell>
                  <Table.HeaderCell>Procedures</Table.HeaderCell>
                  <Table.HeaderCell>Facility</Table.HeaderCell>
                  <Table.HeaderCell>Equipment</Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Status"
                      options={REQUEST_STATUS_OPTIONS}
                      value={status}
                      onChange={(v) => {
                        setStatus(v);
                        setPage(1);
                      }}
                      allLabel="All Status"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {requests.length === 0 ? (
                  <Table.Empty colSpan={7}>
                    {status || patient || vendorId || period || kephLevel
                      ? "No requests match your criteria"
                      : "No medical requests received yet."}
                  </Table.Empty>
                ) : (
                  requests.map((r) => (
                    <Table.Row
                      key={r.internal_request_id ?? requestIdentifier(r)}
                      onClick={() =>
                        router.push(`/requests/${requestIdentifier(r)}`)
                      }
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <Table.Cell>
                        <div className="font-mono text-sm text-slate-900">
                          {requestLabel(r)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {r.modality && (
                            <span className="text-xs text-slate-500">
                              {r.modality}
                            </span>
                          )}
                          {/* A probe worklist from an MWL test, not a real
                            order — it carries no booked service. */}
                          {r.is_test && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Test
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-slate-900">
                          {requestPatientName(r)}
                        </div>
                        {r.patient_mrn && (
                          <div className="text-xs text-slate-500 font-mono">
                            MRN: {r.patient_mrn}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-slate-700">
                          {requestProcedure(r)}
                        </div>
                        {r.procedure_code && (
                          <div className="text-xs text-slate-500 font-mono">
                            {r.procedure_code}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {requestFacility(r)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs font-mono text-slate-500">
                          {r.equipment_code || r.equipment?.name || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={r.status} />
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-600">
                          {formatDateTime(r.created_at)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Phones get one card per order; tapping it opens the order. */}
          <div className="md:hidden divide-y divide-slate-100">
            {requests.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                {status || patient || vendorId || period || kephLevel
                  ? "No requests match your criteria"
                  : "No medical requests received yet."}
              </p>
            ) : (
              requests.map((r) => {
                // Many EMR orders arrive without a patient name, so the order
                // number leads, as it does in the table, and the patient
                // line only appears when there is something to say.
                const patientName = requestPatientName(r);
                const hasPatient = patientName && patientName !== "-";
                return (
                  <div
                    key={r.internal_request_id ?? requestIdentifier(r)}
                    className="p-4 space-y-1.5 cursor-pointer"
                    onClick={() =>
                      router.push(`/requests/${requestIdentifier(r)}`)
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-slate-900 truncate">
                          {requestLabel(r)}
                        </p>
                        {(hasPatient || r.patient_mrn) && (
                          <p className="text-xs text-slate-500 truncate">
                            {hasPatient && patientName}
                            {hasPatient && r.patient_mrn && " · "}
                            {r.patient_mrn && (
                              <span className="font-mono">
                                MRN {r.patient_mrn}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2">
                      {requestProcedure(r)}
                      {r.modality && (
                        <span className="text-slate-400"> · {r.modality}</span>
                      )}
                      {r.is_test && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          Test
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {requestFacility(r)}
                    </p>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      {/* The facility is already on the line above, so only
                        the device half of the machine's name is kept. */}
                      <span className="font-mono truncate">
                        {r.equipment_code ||
                          equipmentDeviceName(r.equipment?.name) ||
                          "No machine"}
                      </span>
                      <span className="shrink-0">
                        {formatDateTime(r.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_MEDICAL_REQUESTS}>
      <RequestsContent />
    </PermissionGate>
  );
}
