"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCog, FaPlus, FaSearch, FaWrench, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useVendor } from "@/features/vendors/useVendor";
import {
  useVendorEquipments,
  useDeleteVendorEquipment,
} from "@/features/vendors/useVendorEquipments";
import { VendorEquipment } from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import BackButton from "@/components/common/BackButton";

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
  const { vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorCode);

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch equipments
  const {
    data: equipmentsData,
    isLoading: equipmentsLoading,
    error: equipmentsError,
  } = useVendorEquipments(vendor?.id || "", {
    page,
    per_page: 15,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    search: search || undefined,
  });

  const deleteEquipmentMutation = useDeleteVendorEquipment();

  const equipments = useMemo(() => equipmentsData?.data || [], [equipmentsData?.data]);
  const pagination = equipmentsData?.pagination;

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    equipments.forEach((eq) => {
      if (eq.category_label) cats.add(eq.category_label);
    });
    return Array.from(cats);
  }, [equipments]);

  // Filtered equipments (client-side filtering for search)
  const filteredEquipments = useMemo(() => {
    if (!search.trim()) return equipments;
    const s = search.toLowerCase();
    return equipments.filter(
      (eq) =>
        eq.name?.toLowerCase().includes(s) ||
        eq.code?.toLowerCase().includes(s) ||
        eq.serial_number?.toLowerCase().includes(s) ||
        eq.brand?.toLowerCase().includes(s) ||
        eq.model?.toLowerCase().includes(s) ||
        eq.category_label?.toLowerCase().includes(s)
    );
  }, [equipments, search]);

  const handleDelete = (equipmentId: string) => {
    if (!vendor?.id) return;
    deleteEquipmentMutation.mutate(
      { vendorId: vendor.id, equipmentId },
      {
        onSuccess: () => setShowDeleteConfirm(null),
      }
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

  // Extract error message from API response or error object
  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object') {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      if (axiosErr.response?.data?.message) {
        return axiosErr.response.data.message;
      }
      if (axiosErr.message) {
        return axiosErr.message;
      }
    }
    return "An unexpected error occurred";
  };

  if (!vendor) {
    const errorMessage = vendorError ? getErrorMessage(vendorError) : "Vendor not found";
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Vendor</h2>
            <p className="text-slate-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (equipmentsError) {
    const errorMessage = getErrorMessage(equipmentsError);
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Equipment</h2>
            <p className="text-slate-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
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
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipments..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <option key={cat} value={cat}>
                {cat}
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
                    <Table.HeaderCell>Manufacture Date</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredEquipments.map((equipment: VendorEquipment) => (
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
                          {formatDate(equipment.manufacture_date)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                            equipment.status
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
                                  `/vendors/${vendorCode}/equipments/${equipment.id}`
                                )
                              }
                            >
                              <FaEye className="text-blue-500" /> View
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(
                                  `/vendors/${vendorCode}/equipments/${equipment.id}/edit`
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
              {filteredEquipments.map((equipment: VendorEquipment) => (
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
                        equipment.status
                      )}`}
                    >
                      {getStatusIcon(equipment.status)}
                      {equipment.status_label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-slate-500 text-xs">Category</p>
                      <p className="text-slate-900">{equipment.category_label}</p>
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
                          `/vendors/${vendorCode}/equipments/${equipment.id}`
                        )
                      }
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/vendors/${vendorCode}/equipments/${equipment.id}/edit`
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
                disabled={deleteEquipmentMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteEquipmentMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
