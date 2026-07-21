"use client";

import { useState } from "react";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import { useVendorEquipments } from "@/features/vendors/useVendorEquipments";
import type { VendorEquipment } from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
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

function VendorEquipmentsContent() {
  const router = useRouter();
  const { vendor, vendorId, isLoading: vendorLoading } = useMyVendor();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [modality, setModality] = useState("");
  const search = useSearchControl(() => setPage(1));

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useVendorEquipments(vendorId, {
    // Search is server-side and unpaginated, so it spans the whole inventory
    // rather than being capped at one page of matches.
    ...(search.isSearching ? {} : { page, per_page: 20 }),
    status: status || undefined,
    search: search.term || undefined,
  });

  const equipments: VendorEquipment[] = data?.data ?? [];
  const pagination = data?.pagination;

  // The vendor equipment endpoint has no modality filter param, so the options
  // come from what this vendor actually owns and filtering happens client-side.
  const modalityOptions = Array.from(
    new Set(equipments.map((eq) => eq.modality).filter(Boolean) as string[]),
  )
    .sort()
    .map((m) => ({ value: m, label: m }));

  // Modality has no server param, so it filters the current page client-side.
  const filtered = modality
    ? equipments.filter((eq) => eq.modality === modality)
    : equipments;

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
                  {pagination?.total ?? equipments.length} items · {vendor?.name}
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
              onClick={() =>
                router.push(`/vendor/equipments/new`)
              }
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add Equipment
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full table-fixed">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell className="w-40">Code</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell className="w-48">Category</Table.HeaderCell>
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
                <Table.HeaderCell>
                  <ColumnFilter
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(v) => {
                      setStatus(v);
                      setPage(1);
                    }}
                    allLabel="All Status"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell className="w-24" align="center">
                  Actions
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {search.isSearching || status || modality
                    ? "No equipment matches your criteria"
                    : "No equipment yet. Add your first item to get started."}
                </Table.Empty>
              ) : (
                filtered.map((eq) => (
                  <Table.Row key={eq.id}>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {eq.code}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div
                        className="font-medium text-slate-900 truncate"
                        title={eq.name}
                      >
                        {eq.name}
                      </div>
                      {eq.serial_number && (
                        <div className="text-xs text-slate-500 font-mono truncate">
                          S/N: {eq.serial_number}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700 block truncate">
                        {eq.category_label}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {eq.modality || "-"}
                      </span>
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
                    <Table.Cell align="center">
                      <ActionMenu menuId={`my-equipment-${eq.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(
                                `/vendor/equipments/${eq.id}`,
                              )
                            }
                          >
                            <FaEye className="text-blue-500" /> View
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(
                                `/vendor/equipments/${eq.id}/edit`,
                              )
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

          {!search.isSearching && pagination && pagination.last_page > 1 && (
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

export default function VendorEquipmentsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_EQUIPMENTS}>
      <VendorEquipmentsContent />
    </PermissionGate>
  );
}
