"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useCancelMedicalRequest,
  useEligibleEquipment,
  useMedicalRequest,
  useRegenerateMwl,
  useRequestCallbackLogs,
  useRetargetMedicalRequest,
} from "@/features/requests/useRequests";
import { MedicalRequestEquipment } from "@/services/apiRequests";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ErrorState } from "@/components/common/ErrorState";
import { Table } from "@/components/Table";
import {
  FaArrowLeft,
  FaBan,
  FaCrosshairs,
  FaSync,
  FaTimes,
} from "react-icons/fa";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-700",
};

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

function RequestDetailContent() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [tab, setTab] = useState<"details" | "callbacks">("details");
  const [showRetarget, setShowRetarget] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [targetEquipment, setTargetEquipment] = useState("");

  const { request, isLoading, error, refetch } = useMedicalRequest(requestId);
  const { logs } = useRequestCallbackLogs(requestId);
  const { equipment: eligible } = useEligibleEquipment(
    requestId,
    request?.facility_id,
  );

  const { cancelRequest, isCancelling } = useCancelMedicalRequest();
  const { retargetRequest, isRetargeting } = useRetargetMedicalRequest();
  const { regenerate, isRegenerating } = useRegenerateMwl();

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <ErrorState
        title="Unable to Load Request"
        error={error}
        message={!error && !request ? "Request not found" : undefined}
        action={{
          label: "Back to Requests",
          onClick: () => router.push("/requests"),
        }}
        fullScreen
      />
    );
  }

  const assignedEquipment: MedicalRequestEquipment[] = Array.isArray(
    request.equipment,
  )
    ? request.equipment
    : request.equipment
      ? [request.equipment]
      : [];

  const patientName =
    [request.patient_first_name, request.patient_last_name]
      .filter(Boolean)
      .join(" ") || "-";

  const details = [
    { label: "Patient", value: patientName },
    { label: "Patient ID", value: request.patient_id },
    { label: "MRN", value: request.patient_mrn },
    { label: "Sex", value: request.sex },
    { label: "Date of Birth", value: request.date_of_birth },
    { label: "Modality", value: request.modality },
    { label: "Facility", value: request.facility_name || request.facility_id },
    { label: "Institution", value: request.institution_name },
    { label: "Claim ID", value: request.claim_id },
    { label: "Payor", value: request.payor },
    { label: "Preauth Code", value: request.preauth_code },
    { label: "Internal ID", value: request.internal_request_id },
  ];

  const isTerminal =
    request.status === "completed" || request.status === "cancelled";

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {request.request_id}
            </h1>
            <p className="text-sm text-slate-500">{patientName}</p>
          </div>
          <span
            className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              STATUS_BADGE[request.status] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            {String(request.status).replace(/_/g, " ")}
          </span>

          <button
            onClick={() => regenerate(requestId)}
            disabled={isRegenerating || isTerminal}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaSync className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            Regenerate MWL
          </button>
          <button
            onClick={() => {
              setTargetEquipment("");
              setShowRetarget(true);
            }}
            disabled={isTerminal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaCrosshairs className="w-3.5 h-3.5" /> Retarget
          </button>
          <button
            onClick={() => setConfirmCancel(true)}
            disabled={isTerminal}
            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaBan className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>

        {request.status_message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-800">
            {request.status_message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex gap-6 border-b border-gray-100 px-4">
            <button
              onClick={() => setTab("details")}
              className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === "details"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setTab("callbacks")}
              className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === "callbacks"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Callback Logs ({logs.length})
            </button>
          </div>

          {tab === "details" ? (
            <div className="p-4 md:p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {details.map((d) => (
                  <div key={d.label}>
                    <p className="text-xs text-slate-500">{d.label}</p>
                    <p className="text-sm font-medium text-slate-900 break-words">
                      {d.value || "-"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Procedures */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Procedures</p>
                {request.procedures?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {request.procedures.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">None</p>
                )}
              </div>

              {/* Assigned equipment */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Assigned Equipment</p>
                {assignedEquipment.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No equipment assigned yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedEquipment.map((eq, i) => (
                      <div
                        key={eq.id ?? i}
                        className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {eq.name || "-"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {eq.asset_id}
                            {eq.dicom_aet ? ` · AET ${eq.dicom_aet}` : ""}
                          </p>
                        </div>
                        {eq.status && (
                          <span className="text-xs text-slate-600 capitalize">
                            {eq.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Created: {formatDateTime(request.created_at)}</span>
                <span>Updated: {formatDateTime(request.updated_at)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table className="w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>URL</Table.HeaderCell>
                      <Table.HeaderCell>Status Code</Table.HeaderCell>
                      <Table.HeaderCell>Result</Table.HeaderCell>
                      <Table.HeaderCell>Attempted</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {logs.length === 0 ? (
                      <Table.Empty colSpan={4}>
                        No callbacks have been sent for this request.
                      </Table.Empty>
                    ) : (
                      logs.map((log, i) => (
                        <Table.Row key={log.id ?? i}>
                          <Table.Cell>
                            <span className="text-xs text-slate-700 font-mono break-all">
                              {log.url || "-"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-700 font-mono">
                              {log.status_code ?? "-"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                log.success
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {log.success ? "Delivered" : "Failed"}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-600">
                              {formatDateTime(log.attempted_at)}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Retarget modal */}
      {showRetarget && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Retarget Request
              </h3>
              <button
                onClick={() => setShowRetarget(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Choose equipment that can handle this request&apos;s procedures.
              The worklist will be regenerated for the new target.
            </p>

            <SearchableSelect
              label="Equipment"
              required
              options={eligible.map((eq) => ({
                value: eq.id ?? "",
                label: `${eq.name ?? "Unnamed"}${eq.asset_id ? ` (${eq.asset_id})` : ""}`,
              }))}
              value={targetEquipment}
              onChange={setTargetEquipment}
              placeholder={
                eligible.length ? "Select equipment" : "No eligible equipment"
              }
              searchPlaceholder="Search equipment..."
            />

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowRetarget(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  retargetRequest(
                    {
                      requestId,
                      data: {
                        facility_id: request.facility_id ?? "",
                        equipment_id: targetEquipment,
                      },
                    },
                    {
                      onSuccess: () => {
                        setShowRetarget(false);
                        refetch();
                      },
                    },
                  )
                }
                disabled={!targetEquipment || isRetargeting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetargeting ? "Retargeting..." : "Retarget"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Cancel Request
            </h3>
            <p className="text-gray-600 mb-6">
              This stops the request from being processed further. This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Request
              </button>
              <button
                onClick={() =>
                  cancelRequest(requestId, {
                    onSuccess: () => {
                      setConfirmCancel(false);
                      refetch();
                    },
                  })
                }
                disabled={isCancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestDetailPage() {
  return (
    <PermissionGate permission={Permission.VIEW_MEDICAL_REQUESTS}>
      <RequestDetailContent />
    </PermissionGate>
  );
}
