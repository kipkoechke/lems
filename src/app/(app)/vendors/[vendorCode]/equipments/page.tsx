"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaCog,
  FaPlus,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useVendor } from "@/features/vendors/useVendor";
import { useSearchControl } from "@/hooks/useSearchControl";
import { SearchField } from "@/components/common/SearchField";
import { useAdminEquipments } from "@/features/vendors/useAdminEquipments";
import { useDeleteEquipment } from "@/features/vendors/useEquipmentDetail";
import { AdminEquipment } from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import BackButton from "@/components/common/BackButton";
import { ErrorState } from "@/components/common/ErrorState";

// Status badge colors
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "maintenance":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "inactive":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "decommissioned":
      return "bg-red-50 text-red-700 border-red-200";
    case "pending_installation":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

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

export default function VendorEquipmentsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;

  // Get vendor details to get the vendor ID
  const {
    vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useVendor(vendorCode);

  // State
  const [page, setPage] = useState(1);
  const search = useSearchControl(() => setPage(1));
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Admins read the admin equipment list scoped to this vendor. The
  // /vendor/equipments route infers the vendor from the token and is gated to
  // the vendor role, so it 403s here.
  const {
    equipments,
    pagination,
    isLoading: equipmentsLoading,
    error: equipmentsError,
    refetch,
  } = useAdminEquipments(
    {
      vendor_id: vendor?.id,
      // Searching is unpaginated so results span this vendor's whole
      // inventory rather than being capped at one page of matches.
      ...(search.isSearching ? {} : { page, per_page: 15 }),
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      search: search.term || undefined,
    },
    { enabled: !!vendor?.id },
  );

  const { deleteEquipment, isDeleting } = useDeleteEquipment();

  // Category options: filter by the code the API expects, show the label.
  const categories = useMemo(() => {
    const byCode = new Map<string, string>();
    equipments.forEach((eq) => {
      if (eq.category) byCode.set(eq.category, eq.category_label || eq.category);
    });
    return Array.from(byCode, ([value, label]) => ({ value, label }));
  }, [equipments]);

  // Search is applied server-side; re-filtering here would only hide rows the
  // API already matched on fields this list doesn't show.
  const filteredEquipments = equipments;

  const handleDelete = (equipmentId: string) => {
    deleteEquipment(equipmentId, {
      onSuccess: () => setShowDeleteConfirm(null),
    });
  };

  const isLoading = vendorLoading || equipmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 text-sm">Loading equipments...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <ErrorState
        title="Unable to Load Vendor"
        error={vendorError}
        message={!vendorError ? "Vendor not found" : undefined}
        action={{
          label: "Go Back",
          onClick: () => router.back(),
        }}
        fullScreen
      />
    );
  }

  if (equipmentsError) {
    return (
      <ErrorState
        title="Unable to Load Equipment"
        error={equipmentsError}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Equipments</h1>
            <p className="text-sm text-slate-500">{vendor.name}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/vendors/${vendorCode}/equipments/new`)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <FaPlus className="w-3 h-3" />
          Add Equipment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchField
              value={search.input}
              onChange={search.onInputChange}
              onSearch={search.submit}
              onClear={search.clear}
              placeholder="Search equipments..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="inactive">Inactive</option>
            <option value="decommissioned">Decommissioned</option>
            <option value="pending_installation">Pending Installation</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FaCog className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">
                {pagination?.total || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FaCheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-lg font-bold text-slate-900">
                {equipments.filter((e) => e.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <FaWrench className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Maintenance</p>
              <p className="text-lg font-bold text-slate-900">
                {equipments.filter((e) => e.status === "maintenance").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <FaTimesCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Decommissioned</p>
              <p className="text-lg font-bold text-slate-900">
                {equipments.filter((e) => e.status === "decommissioned").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {equipmentsError ? (
          <div className="p-8 text-center text-red-600">
            Failed to load equipments. Please try again.
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {search || statusFilter || categoryFilter
              ? "No equipments match your filters"
              : "No equipments found. Add your first equipment!"}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Equipment</Table.HeaderCell>
                    <Table.HeaderCell>Category</Table.HeaderCell>
                    <Table.HeaderCell>Brand / Model</Table.HeaderCell>
                    <Table.HeaderCell>Serial Number</Table.HeaderCell>
                    <Table.HeaderCell>Modality</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredEquipments.map((equipment: AdminEquipment) => (
                    <Table.Row key={equipment.id}>
                      <Table.Cell>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {equipment.name}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            {equipment.code}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {equipment.category_label}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="text-sm text-slate-900">
                            {equipment.brand || "-"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {equipment.model || "-"}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700 font-mono">
                          {equipment.serial_number || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {equipment.modality || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                            equipment.status,
                          )}`}
                        >
                          {getStatusIcon(equipment.status)}
                          {equipment.status_label}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <ActionMenu menuId={`equipment-${equipment.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(
                                  `/vendors/${vendorCode}/equipments/${equipment.id}`,
                                )
                              }
                            >
                              <FaEye className="text-blue-500" /> View
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(
                                  `/vendors/${vendorCode}/equipments/${equipment.id}/edit`,
                                )
                              }
                            >
                              <FaEdit className="text-amber-500" /> Edit
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => setShowDeleteConfirm(equipment.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <FaTrash className="text-red-500" /> Delete
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 p-4">
              {filteredEquipments.map((equipment: AdminEquipment) => (
                <div
                  key={equipment.id}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {equipment.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {equipment.code}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                        equipment.status,
                      )}`}
                    >
                      {getStatusIcon(equipment.status)}
                      {equipment.status_label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-slate-500 text-xs">Category</p>
                      <p className="text-slate-900">
                        {equipment.category_label}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Brand</p>
                      <p className="text-slate-900">{equipment.brand || "-"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Model</p>
                      <p className="text-slate-900">{equipment.model || "-"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Serial</p>
                      <p className="text-slate-900 font-mono text-xs">
                        {equipment.serial_number || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/vendors/${vendorCode}/equipments/${equipment.id}`,
                        )
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/vendors/${vendorCode}/equipments/${equipment.id}/edit`,
                        )
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(equipment.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Equipment
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Are you sure you want to delete this equipment? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
