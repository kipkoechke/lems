"use client";

import { useState } from "react";
import { useSearchControl } from "@/hooks/useSearchControl";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useDicomModalities,
  useDicomServerStatus,
  useRegisterAllModalities,
  useTestEquipmentDicom,
  useUnregisterEquipmentModality,
} from "@/features/dicom/useDicom";
import { useAdminEquipments } from "@/features/vendors/useAdminEquipments";
import type { AdminEquipment } from "@/services/apiEquipment";
import {
  modalityAet,
  modalityHost,
  modalityName,
  modalityPort,
} from "@/services/apiDicom";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ErrorState } from "@/components/common/ErrorState";
import {
  FaNetworkWired,
  FaServer,
  FaSync,
  FaPlug,
  FaTrash,
  FaCircle,
} from "react-icons/fa";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

/** Live means a C-ECHO answered recently, not merely that it was registered. */
function LinkBadge({ live }: { live?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        live
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-50 text-slate-500 border-slate-200"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          live ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
        }`}
      />
      {live ? "Live" : "Offline"}
    </span>
  );
}

/**
 * One machine or modality on a phone. Six columns of addresses and timestamps
 * do not survive 390px, so the AE title and address share a line under the
 * name, and the link state sits opposite it where a glance finds it.
 */
function DicomCard({
  name,
  code,
  vendor,
  aeTitle,
  address,
  live,
  lastSeenAt,
  children,
}: {
  name: string;
  code?: string | null;
  vendor?: string | null;
  aeTitle?: string | null;
  address: string;
  live?: boolean;
  lastSeenAt?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 line-clamp-2">{name}</p>
          {(code || vendor) && (
            <p className="text-[11px] text-slate-400 truncate">
              {code && <span className="font-mono">{code}</span>}
              {code && vendor && " · "}
              {vendor}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <LinkBadge live={live} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
          {aeTitle || "-"}
        </span>
        <span className="font-mono text-slate-600 break-all">{address}</span>
      </div>
      <p className="text-[11px] text-slate-400">
        Last seen {formatDateTime(lastSeenAt)}
      </p>
      {children}
    </div>
  );
}

function DicomContent() {
  const [tab, setTab] = useState<"equipment" | "modalities">("equipment");
  const search = useSearchControl();

  const { status, isLoading: statusLoading } = useDicomServerStatus();
  const {
    modalities,
    isLoading: modalitiesLoading,
    error: modalitiesError,
    refetch: refetchModalities,
  } = useDicomModalities();
  const { registerAll, isRegistering } = useRegisterAllModalities();
  const { testConnection, isTesting } = useTestEquipmentDicom();
  const { unregisterModality, isUnregistering } =
    useUnregisterEquipmentModality();

  // Unregistering drops the machine from Orthanc, so it stops being able to
  // query worklists until someone registers it again. One tap should not do
  // that — least of all a stray one on a phone, where the button is wide.
  const confirmUnregister = (eq: AdminEquipment) => {
    if (
      window.confirm(
        `Unregister ${eq.name} (${eq.dicom?.ae_title ?? eq.code}) from Orthanc? It will not be able to pull worklists until it is registered again.`,
      )
    ) {
      unregisterModality(eq.id);
    }
  };

  const { equipments, isLoading: equipmentLoading } = useAdminEquipments({
    // Unpaginated while searching so matches are not capped at one page.
    ...(search.isSearching ? {} : { per_page: 100 }),
    search: search.term || undefined,
  });

  // Only imaging devices with DICOM details are relevant here.
  const dicomEquipment = (equipments ?? []).filter(
    (eq: AdminEquipment) => !!eq.dicom,
  );

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaNetworkWired className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  DICOM Integration
                </h1>
                <p className="text-sm text-slate-500">
                  Orthanc server and modality registration
                </p>
              </div>
            </div>

            <button
              onClick={() => registerAll()}
              disabled={isRegistering}
              className="lg:ml-auto shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaSync
                className={`w-3 h-3 ${isRegistering ? "animate-spin" : ""}`}
              />
              {isRegistering ? "Registering..." : "Register All Modalities"}
            </button>
          </div>
        </div>

        {/* Server status */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          {statusLoading ? (
            <div className="h-12 bg-slate-100 rounded animate-pulse" />
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    status?.connected ? "bg-emerald-100" : "bg-red-100"
                  }`}
                >
                  <FaServer
                    className={`w-4 h-4 ${
                      status?.connected ? "text-emerald-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Orthanc Server</p>
                  <p
                    className={`text-sm font-semibold flex items-center gap-1.5 ${
                      status?.connected ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    <FaCircle className="w-2 h-2" />
                    {status?.connected ? "Connected" : "Disconnected"}
                  </p>
                </div>
              </div>

              {[
                { label: "Version", value: status?.server?.version },
                { label: "AE Title", value: status?.server?.dicom_aet },
                {
                  label: "Host",
                  value:
                    status?.server?.server_ip && status?.server?.dicom_port
                      ? `${status.server.server_ip}:${status.server.dicom_port}`
                      : status?.server?.server_ip,
                },
                {
                  label: "Registered Modalities",
                  value: status?.server?.modalities_count?.toString(),
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-medium text-slate-900 font-mono">
                    {item.value || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* The search drops under the tabs on a phone; beside them it was
              a fixed 16rem that the row could not fit. */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 px-4">
            <div className="flex gap-6">
              <button
                onClick={() => setTab("equipment")}
                className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === "equipment"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Equipment ({dicomEquipment.length})
              </button>
              <button
                onClick={() => setTab("modalities")}
                className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === "modalities"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Orthanc Modalities ({modalities.length})
              </button>
            </div>
            {tab === "equipment" && (
              <div className="w-full sm:w-64 pb-2 sm:py-2">
                <SearchField
                  value={search.input}
                  onChange={search.onInputChange}
                  onSearch={search.submit}
                  onClear={search.clear}
                  placeholder="Search equipment..."
                />
              </div>
            )}
          </div>

          {/* Equipment tab */}
          {tab === "equipment" && (
            <div className="p-4">
              {equipmentLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-slate-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                  <Table className="w-full">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Equipment</Table.HeaderCell>
                        <Table.HeaderCell>AE Title</Table.HeaderCell>
                        <Table.HeaderCell>Host : Port</Table.HeaderCell>
                        <Table.HeaderCell>Link</Table.HeaderCell>
                        <Table.HeaderCell>Last Seen</Table.HeaderCell>
                        <Table.HeaderCell align="right">
                          Actions
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {dicomEquipment.length === 0 ? (
                        <Table.Empty colSpan={6}>
                          {search.isSearching
                            ? "No DICOM equipment matches your search"
                            : "No equipment has DICOM configured yet."}
                        </Table.Empty>
                      ) : (
                        dicomEquipment.map((eq: AdminEquipment) => (
                          <Table.Row key={eq.id}>
                            <Table.Cell>
                              <div className="font-medium text-slate-900">
                                {eq.name}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                {eq.code}
                              </div>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                {eq.dicom?.ae_title || "-"}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm text-slate-700 font-mono">
                                {eq.dicom?.hl7_host || "-"}
                                {eq.dicom?.dicom_port
                                  ? `:${eq.dicom.dicom_port}`
                                  : ""}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <LinkBadge live={eq.dicom?.is_connected} />
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm text-slate-600">
                                {formatDateTime(eq.dicom?.last_seen_at)}
                              </span>
                            </Table.Cell>
                            <Table.Cell align="right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => testConnection(eq.id)}
                                  disabled={isTesting}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
                                >
                                  <FaPlug className="w-3 h-3" /> Test
                                </button>
                                <button
                                  onClick={() => confirmUnregister(eq)}
                                  disabled={isUnregistering}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors disabled:opacity-50"
                                >
                                  <FaTrash className="w-3 h-3" /> Unregister
                                </button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </div>
              )}
              {!equipmentLoading && (
                <div className="md:hidden rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {dicomEquipment.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                      {search.isSearching
                        ? "No DICOM equipment matches your search"
                        : "No equipment has DICOM configured yet."}
                    </p>
                  ) : (
                    dicomEquipment.map((eq: AdminEquipment) => (
                      <DicomCard
                        key={eq.id}
                        name={eq.name}
                        code={eq.code}
                        aeTitle={eq.dicom?.ae_title}
                        address={`${eq.dicom?.hl7_host || "-"}${
                          eq.dicom?.dicom_port ? `:${eq.dicom.dicom_port}` : ""
                        }`}
                        live={eq.dicom?.is_connected}
                        lastSeenAt={eq.dicom?.last_seen_at}
                      >
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => testConnection(eq.id)}
                            disabled={isTesting}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 disabled:opacity-50"
                          >
                            <FaPlug className="w-3 h-3" /> Test
                          </button>
                          <button
                            onClick={() => confirmUnregister(eq)}
                            disabled={isUnregistering}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border border-slate-200 text-red-600 disabled:opacity-50"
                          >
                            <FaTrash className="w-3 h-3" /> Unregister
                          </button>
                        </div>
                      </DicomCard>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modalities tab */}
          {tab === "modalities" && (
            <div className="p-4">
              {modalitiesLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-slate-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : modalitiesError ? (
                <ErrorState
                  title="Unable to Load Modalities"
                  error={modalitiesError}
                  action={{
                    label: "Try Again",
                    onClick: () => refetchModalities(),
                  }}
                />
              ) : (
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                  <Table className="w-full">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>AET</Table.HeaderCell>
                        <Table.HeaderCell>Host : Port</Table.HeaderCell>
                        <Table.HeaderCell>Vendor</Table.HeaderCell>
                        <Table.HeaderCell>Link</Table.HeaderCell>
                        <Table.HeaderCell>Last Seen</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {modalities.length === 0 ? (
                        <Table.Empty colSpan={6}>
                          No modalities registered in Orthanc.
                        </Table.Empty>
                      ) : (
                        modalities.map((m, idx) => (
                          <Table.Row key={modalityAet(m) + idx}>
                            <Table.Cell>
                              <div className="font-medium text-slate-900">
                                {modalityName(m)}
                              </div>
                              {m.equipment?.code && (
                                <div className="text-xs text-slate-500 font-mono">
                                  {m.equipment.code}
                                </div>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                {modalityAet(m)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm text-slate-700 font-mono">
                                {modalityHost(m)}
                                {modalityPort(m) !== "-"
                                  ? `:${modalityPort(m)}`
                                  : ""}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm text-slate-700">
                                {m.vendor?.name || "-"}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <LinkBadge live={m.is_connected} />
                            </Table.Cell>
                            <Table.Cell>
                              <span className="text-sm text-slate-600">
                                {formatDateTime(m.last_seen_at)}
                              </span>
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </div>
              )}
              {!modalitiesLoading && !modalitiesError && (
                <div className="md:hidden rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {modalities.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                      No modalities registered in Orthanc.
                    </p>
                  ) : (
                    modalities.map((m, idx) => (
                      <DicomCard
                        key={modalityAet(m) + idx}
                        name={modalityName(m)}
                        code={m.equipment?.code}
                        vendor={m.vendor?.name}
                        aeTitle={modalityAet(m)}
                        address={`${modalityHost(m)}${
                          modalityPort(m) !== "-" ? `:${modalityPort(m)}` : ""
                        }`}
                        live={m.is_connected}
                        lastSeenAt={m.last_seen_at}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DicomPage() {
  return (
    <PermissionGate permission={Permission.MANAGE_DICOM}>
      <DicomContent />
    </PermissionGate>
  );
}
