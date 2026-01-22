"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaCog,
  FaPlus,
  FaSearch,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useVendorEquipments,
  useDeleteVendorEquipment,
} from "@/features/vendors/useVendorEquipments";
import { VendorEquipment } from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";

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

export default function EquipmentsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  
  // Get vendor ID from the current user's entity
  const vendorId = user?.entity?.id || "";

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch equipments
  const {
    data: equipmentsData,
    isLoading,
    error,
  } = useVendorEquipments(vendorId, {
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

  const handleDelete = async (equipmentId: string) => {
    if (!vendorId) return;
    deleteEquipmentMutation.mutate(
      { vendorId, equipmentId },
      {
        onSuccess: () => {
          setShowDeleteConfirm(null);
        },
      }
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!vendorId) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-slate-600">Vendor information not available</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
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

  if (error) {
    const errorMessage = getErrorMessage(error);
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
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Equipment</h1>
              <p className="text-sm text-slate-500">
                {pagination?.total || 0} equipment items
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/equipments/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <FaPlus className="w-3 h-3" /> Add Equipment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, code, serial number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
              <option value="decommissioned">Decommissioned</option>
              <option value="pending_installation">Pending Installation</option>
            </select>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-lg border border-slate-200 hidden md:block overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Category</Table.HeaderCell>
                <Table.HeaderCell>Brand / Model</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredEquipments.length === 0 ? (
                <Table.Empty colSpan={6}>No equipment found</Table.Empty>
              ) : (
                filteredEquipments.map((equipment: VendorEquipment) => (
                  <Table.Row key={equipment.id}>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {equipment.code}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">
                        {equipment.name}
                      </div>
                      {equipment.serial_number && (
                        <div className="text-xs text-slate-500 font-mono">
                          S/N: {equipment.serial_number}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {equipment.category_label}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {equipment.brand || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {equipment.model || "-"}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                          equipment.status
                        )}`}
                      >
                        {getStatusIcon(equipment.status)}
                        {equipment.status_label}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`equipment-${equipment.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(`/equipments/${equipment.id}`)
                            }
                          >
                            <FaEye className="text-blue-500" /> View
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(`/equipments/${equipment.id}/edit`)
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
                ))
              )}
            </Table.Body>
          </Table>

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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredEquipments.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
              No equipment found
            </div>
          ) : (
            filteredEquipments.map((equipment: VendorEquipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-lg border border-slate-200 p-4"
                onClick={() => router.push(`/equipments/${equipment.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {equipment.code}
                    </span>
                    <h3 className="font-semibold text-slate-900 mt-2">
                      {equipment.name}
                    </h3>
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

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category</span>
                    <span className="text-slate-900">
                      {equipment.category_label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Brand</span>
                    <span className="text-slate-900">
                      {equipment.brand || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model</span>
                    <span className="text-slate-900">
                      {equipment.model || "-"}
                    </span>
                  </div>
                  {equipment.serial_number && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Serial</span>
                      <span className="text-slate-900 font-mono text-xs">
                        {equipment.serial_number}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/equipments/${equipment.id}/edit`);
                    }}
                    className="flex-1 py-2 text-sm text-amber-600 bg-amber-50 rounded-lg font-medium hover:bg-amber-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(equipment.id);
                    }}
                    className="flex-1 py-2 text-sm text-red-600 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Mobile Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-white rounded-lg border border-slate-200">
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Delete Equipment
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this equipment? This action
                cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deleteEquipmentMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {deleteEquipmentMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
