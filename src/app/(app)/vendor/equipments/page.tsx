"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useRouter, useSearchParams } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import { useVendorEquipments } from "@/features/vendors/useVendorEquipments";
import {
  equipmentDeviceName,
  equipmentOwnerName,
  type VendorEquipment,
} from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  ConnectionState,
  connectionState,
  type ConnectionStateKey,
} from "@/components/common/ConnectivityBadges";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { titleCase } from "@/lib/format";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import {
  FaCog,
  FaEdit,
  FaEye,
  FaPlus,
  FaCheckCircle,
  FaWrench,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  pending_installation: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
  { value: "decommissioned", label: "Decommissioned" },
  { value: "pending_installation", label: "Pending Installation" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <FaCheckCircle className="w-3 h-3" />;
    case "maintenance":
      return <FaWrench className="w-3 h-3" />;
    case "decommissioned":
      return <FaTimesCircle className="w-3 h-3" />;
    case "pending_installation":
      return <FaClock className="w-3 h-3" />;
    default:
      return null;
  }
};

const PAGE_SIZE = 20;

type ConnectionView = "all" | ConnectionStateKey;

function VendorEquipmentsContent() {
  const router = useRouter();
  const { vendor, vendorId, isLoading: vendorLoading } = useMyVendor();

  const [page, setPage] = useState(1);
  // The overview links here with ?status=pending_installation.
  const [status, setStatus] = useState(useSearchParams().get("status") ?? "");
  const [modality, setModality] = useState("");
  const [view, setView] = useState<ConnectionView>("all");
  const search = useSearchControl(() => setPage(1));

  // The whole fleet in one request — a vendor has tens of machines — so the
  // connection views can count and filter it, which the API cannot. Paging
  // happens here. A fleet past 100 machines would need the API's paging back.
  const { data, isLoading, error, refetch } = useVendorEquipments(vendorId, {
    per_page: 100,
    status: status || undefined,
    search: search.term || undefined,
  });

  const fleet: VendorEquipment[] = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.pagination;

  const stateOf = (eq: VendorEquipment) =>
    connectionState(eq.is_connected ?? eq.dicom?.is_connected, eq.linked);
  const counts = fleet.reduce<Record<ConnectionStateKey, number>>(
    (acc, eq) => ({ ...acc, [stateOf(eq)]: acc[stateOf(eq)] + 1 }),
    { live: 0, offline: 0, never: 0 },
  );
  const inView =
    view === "all" ? fleet : fleet.filter((eq) => stateOf(eq) === view);

  // The endpoint publishes the valid filter values it accepts; fall back to the
  // local list only when a deployment doesn't send them.
  const statusOptions = data?.available_filters?.status?.length
    ? data.available_filters.status
    : STATUS_OPTIONS;

  // The vendor equipment endpoint has no modality filter param, so the options
  // come from what this vendor actually owns and filtering happens client-side.
  const modalityOptions = Array.from(
    new Set(fleet.map((eq) => eq.modality).filter(Boolean) as string[]),
  )
    .sort()
    .map((m) => ({ value: m, label: m }));

  // Modality has no server param, so it filters client-side.
  const matching = modality
    ? inView.filter((eq) => eq.modality === modality)
    : inView;
  const lastPage = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const filtered = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (vendorLoading || isLoading) {
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
        title="Unable to Load Your Equipment"
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
                <FaCog className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  My Equipment
                </h1>
                <p className="text-sm text-slate-500">
                  {pagination?.total ?? fleet.length}{" "}
                  {status ? "matching" : "machines"} · {vendor?.name}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search by name, code, serial number..."
              />
            </div>

            <button
              onClick={() => router.push(`/vendor/equipments/new`)}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add Equipment
            </button>
          </div>

          {/* The question a vendor scans this list for: which machines are
              reachable. Counts follow the status and search above. */}
          <SegmentedControl
            className="mt-3"
            value={view}
            onChange={(next) => {
              setView(next);
              setPage(1);
            }}
            options={(
              [
                ["all", "All", fleet.length],
                ["live", "Live", counts.live],
                ["offline", "Offline", counts.offline],
                ["never", "Never connected", counts.never],
              ] as const
            ).map(([value, label, count]) => ({
              value,
              // Count over label: four "Never connected 34" pills do not fit
              // a phone side by side.
              label: (
                <span className="flex flex-col items-center">
                  <span className="tabular-nums font-semibold">{count}</span>
                  <span className="text-xs">{label}</span>
                </span>
              ),
            }))}
          />

          {/* On a desktop these two filters sit in the column headers. The
              phone has no headers, so they come up here instead. */}
          <div className="md:hidden grid grid-cols-2 gap-2 mt-3">
            <SearchableSelect
              label=""
              compact
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              placeholder="All Status"
              options={statusOptions}
            />
            <SearchableSelect
              label=""
              compact
              value={modality}
              onChange={setModality}
              placeholder="All Modalities"
              searchPlaceholder="Search modality..."
              options={modalityOptions}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="hidden md:block">
            <Table className="w-full table-fixed">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="w-[24rem]">
                    Equipment
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Status"
                      options={statusOptions}
                      value={status}
                      onChange={(v) => {
                        setStatus(v);
                        setPage(1);
                      }}
                      allLabel="All Status"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell className="w-36">
                    Connection
                  </Table.HeaderCell>
                  <Table.HeaderCell className="w-32">
                    <ColumnFilter
                      label="Modality"
                      options={modalityOptions}
                      value={modality}
                      onChange={setModality}
                      allLabel="All Modalities"
                      searchPlaceholder="Search modality..."
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell className="w-24" align="center">
                    Actions
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.length === 0 ? (
                  <Table.Empty colSpan={5}>
                    {search.isSearching || status || modality || view !== "all"
                      ? "No equipment matches your criteria"
                      : "No equipment yet. Add your first item to get started."}
                  </Table.Empty>
                ) : (
                  filtered.map((eq) => (
                    <Table.Row key={eq.id}>
                      {/* Code, name and serial are one identity, so they share
                        a cell rather than costing two columns. */}
                      <Table.Cell>
                        <div
                          className="font-medium text-slate-900 truncate max-w-[22rem]"
                          title={eq.name}
                        >
                          {equipmentDeviceName(eq.name)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 max-w-[22rem]">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {eq.code}
                          </span>
                          {equipmentOwnerName(eq.name) && (
                            <span className="text-[11px] text-slate-500 truncate">
                              {titleCase(equipmentOwnerName(eq.name) ?? "")}
                            </span>
                          )}
                          {eq.serial_number && (
                            <span className="text-[11px] text-slate-400 font-mono truncate">
                              S/N {eq.serial_number}
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            STATUS_BADGE[eq.status] ??
                            "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {getStatusIcon(eq.status)}
                          {eq.status_label}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {/* Live is now, linked is ever — the pair is what tells
                          a vendor whether a machine is actually reachable. */}
                        <ConnectionState
                          isConnected={
                            eq.is_connected ?? eq.dicom?.is_connected
                          }
                          linked={eq.linked}
                          lastSeenAt={eq.last_seen_at ?? eq.dicom?.last_seen_at}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {eq.modality || "-"}
                        </span>
                        {eq.category_label && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {eq.category_label}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell align="center">
                        <ActionMenu menuId={`my-equipment-${eq.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/vendor/equipments/${eq.id}`)
                              }
                            >
                              <FaEye className="text-blue-500" /> View
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/vendor/equipments/${eq.id}/edit`)
                              }
                            >
                              <FaEdit className="text-amber-500" /> Edit
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Phones get one card per machine; tapping it opens the machine,
              which is where both View and Edit lead from. */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                {search.isSearching || status || modality || view !== "all"
                  ? "No equipment matches your criteria"
                  : "No equipment yet. Add your first item to get started."}
              </p>
            ) : (
              filtered.map((eq) => (
                <div
                  key={eq.id}
                  className="p-4 space-y-2 cursor-pointer"
                  onClick={() => router.push(`/vendor/equipments/${eq.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {equipmentDeviceName(eq.name)}
                      </p>
                      {equipmentOwnerName(eq.name) && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {titleCase(equipmentOwnerName(eq.name) ?? "")}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        STATUS_BADGE[eq.status] ??
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {getStatusIcon(eq.status)}
                      {eq.status_label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {eq.code}
                    </span>
                    {eq.modality && (
                      <span className="text-slate-600">{eq.modality}</span>
                    )}
                    {eq.serial_number && (
                      <span className="text-slate-400 font-mono">
                        S/N {eq.serial_number}
                      </span>
                    )}
                  </div>
                  <ConnectionState
                    isConnected={eq.is_connected ?? eq.dicom?.is_connected}
                    linked={eq.linked}
                    lastSeenAt={eq.last_seen_at ?? eq.dicom?.last_seen_at}
                  />
                </div>
              ))
            )}
          </div>

          {lastPage > 1 && (
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              total={matching.length}
              from={(page - 1) * PAGE_SIZE + 1}
              to={Math.min(page * PAGE_SIZE, matching.length)}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendorEquipmentsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_EQUIPMENTS}>
      <Suspense fallback={null}>
        <VendorEquipmentsContent />
      </Suspense>
    </PermissionGate>
  );
}
