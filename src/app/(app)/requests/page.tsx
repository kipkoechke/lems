"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMedicalRequests } from "@/features/requests/useRequests";
import {
  MedicalRequest,
  REQUEST_STATUS_OPTIONS,
} from "@/services/apiRequests";
import { Table } from "@/components/Table";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ErrorState } from "@/components/common/ErrorState";
import { FaFileMedical } from "react-icons/fa";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
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

const patientName = (r: MedicalRequest) =>
  [r.patient_first_name, r.patient_last_name].filter(Boolean).join(" ") || "-";

function RequestsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [patient, setPatient] = useState("");

  const { requests, pagination, isLoading, error, refetch } = useMedicalRequests(
    {
      page,
      page_size: 20,
      status: status || undefined,
      patient: patient || undefined,
    },
  );

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
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 border-b border-slate-100">
            <div className="w-full sm:w-48">
              <SearchableSelect
                label="Status"
                options={REQUEST_STATUS_OPTIONS}
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                placeholder="All Status"
                searchPlaceholder="Search status..."
              />
            </div>
          </div>

          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Request ID</Table.HeaderCell>
                <Table.HeaderCell>Patient</Table.HeaderCell>
                <Table.HeaderCell>Procedures</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {status || patient
                    ? "No requests match your criteria"
                    : "No medical requests received yet."}
                </Table.Empty>
              ) : (
                requests.map((r) => (
                  <Table.Row
                    key={r.internal_request_id ?? r.request_id}
                    onClick={() => router.push(`/requests/${r.request_id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <Table.Cell>
                      <div className="font-mono text-sm text-slate-900">
                        {r.request_id}
                      </div>
                      {r.modality && (
                        <div className="text-xs text-slate-500">
                          {r.modality}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {patientName(r)}
                      </div>
                      {r.patient_mrn && (
                        <div className="text-xs text-slate-500 font-mono">
                          MRN: {r.patient_mrn}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {r.procedures?.length
                          ? r.procedures.join(", ")
                          : "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {r.facility_name || r.facility_id || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          STATUS_BADGE[r.status] ??
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {String(r.status).replace(/_/g, " ")}
                      </span>
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
