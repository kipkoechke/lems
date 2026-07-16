"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useApprovePingRequest,
  usePendingPingRequests,
  useRejectPingRequest,
} from "@/features/pingRequests/usePingRequests";
import { useAdminEquipments } from "@/features/vendors/useAdminEquipments";
import {
  AeTitleSource,
  PingRequest,
  PingRequestDecision,
} from "@/services/apiPingRequests";
import { Table } from "@/components/Table";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaSatelliteDish, FaCheck, FaTimes } from "react-icons/fa";

const AE_TITLE_SOURCES: { value: AeTitleSource; label: string }[] = [
  { value: "machine_ping", label: "Use AE title from machine ping" },
  { value: "system_generated", label: "System generated" },
  { value: "custom", label: "Custom AE title" },
];

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

interface DecisionForm {
  approval_reason?: string;
  equipment_id?: string;
  ae_title_source?: AeTitleSource;
  selected_ae_title?: string;
}

function PingRequestsContent() {
  const { pingRequests, isLoading, error, refetch } = usePendingPingRequests();
  const { approveRequest, isApproving } = useApprovePingRequest();
  const { rejectRequest, isRejecting } = useRejectPingRequest();
  const { equipments } = useAdminEquipments({ per_page: 100 });

  const [active, setActive] = useState<PingRequest | null>(null);
  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [equipmentId, setEquipmentId] = useState("");
  const [aeSource, setAeSource] = useState<AeTitleSource>("machine_ping");

  const { register, handleSubmit, reset } = useForm<DecisionForm>();

  const equipmentOptions = (equipments ?? []).map((eq) => ({
    value: eq.id,
    label: `${eq.name} (${eq.code})`,
  }));

  const openDecision = (request: PingRequest, decision: "approve" | "reject") => {
    setActive(request);
    setMode(decision);
    setEquipmentId(request.equipment_id ?? "");
    setAeSource("machine_ping");
    reset({ approval_reason: "", selected_ae_title: "" });
  };

  const onSubmit = (data: DecisionForm) => {
    if (!active) return;

    const payload: PingRequestDecision = {
      approval_reason: data.approval_reason || undefined,
      equipment_id: equipmentId || undefined,
      ae_title_source: mode === "approve" ? aeSource : undefined,
      selected_ae_title:
        mode === "approve" && aeSource === "custom"
          ? data.selected_ae_title || undefined
          : undefined,
    };

    const onSuccess = () => setActive(null);

    if (mode === "approve") {
      approveRequest({ pingRequestId: active.id, data: payload }, { onSuccess });
    } else {
      rejectRequest({ pingRequestId: active.id, data: payload }, { onSuccess });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(4)].map((_, i) => (
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
        title="Unable to Load Ping Requests"
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FaSatelliteDish className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Machine Ping Requests
              </h1>
              <p className="text-sm text-slate-500">
                {pingRequests.length} pending approval · refreshes automatically
              </p>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>AE Title</Table.HeaderCell>
                <Table.HeaderCell>Source Address</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Modality</Table.HeaderCell>
                <Table.HeaderCell>Linked Equipment</Table.HeaderCell>
                <Table.HeaderCell>Seen</Table.HeaderCell>
                <Table.HeaderCell align="right">Decision</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pingRequests.length === 0 ? (
                <Table.Empty colSpan={7}>
                  No ping requests are waiting for approval.
                </Table.Empty>
              ) : (
                pingRequests.map((req) => (
                  <Table.Row key={req.id}>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {req.ae_title}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700 font-mono">
                        {req.ip_addr}:{req.port}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700 capitalize">
                        {req.request_type || "ping"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {req.modality || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {req.equipment?.name || "Unlinked"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-600">
                        {formatDateTime(req.created_at)}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDecision(req, "approve")}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <FaCheck className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => openDecision(req, "reject")}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Decision modal */}
      {active && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {mode === "approve" ? "Approve" : "Reject"} Ping Request
                </h3>
                <button
                  onClick={() => setActive(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">AE Title</span>
                  <span className="font-mono text-slate-900">
                    {active.ae_title}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Address</span>
                  <span className="font-mono text-slate-900">
                    {active.ip_addr}:{active.port}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <SearchableSelect
                  label="Link to Equipment"
                  options={equipmentOptions}
                  value={equipmentId}
                  onChange={setEquipmentId}
                  placeholder="Select equipment (optional)"
                  searchPlaceholder="Search equipment..."
                />

                {mode === "approve" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        AE Title Source
                      </label>
                      <select
                        value={aeSource}
                        onChange={(e) =>
                          setAeSource(e.target.value as AeTitleSource)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        {AE_TITLE_SOURCES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {aeSource === "custom" && (
                      <InputField
                        label="Custom AE Title"
                        type="text"
                        placeholder="Max 16 characters"
                        register={register("selected_ae_title")}
                      />
                    )}
                  </>
                )}

                <InputField
                  label={mode === "approve" ? "Approval Reason" : "Reason"}
                  type="text"
                  placeholder="Optional note for the audit trail"
                  register={register("approval_reason")}
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isApproving || isRejecting}
                    className={`flex-1 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      mode === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isApproving || isRejecting
                      ? "Submitting..."
                      : mode === "approve"
                        ? "Approve"
                        : "Reject"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PingRequestsPage() {
  return (
    <PermissionGate permission={Permission.MANAGE_DICOM}>
      <PingRequestsContent />
    </PermissionGate>
  );
}
