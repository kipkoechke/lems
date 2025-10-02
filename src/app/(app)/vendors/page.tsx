"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useVendors } from "@/features/vendors/useVendors";
import { useDeleteVendor } from "@/features/vendors/useDeleteVendor";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Table } from "@/components/Table";
import {
  FaBuilding,
  FaCheck,
  FaEdit,
  FaEye,
  FaFileContract,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

function VendorsContent() {
  const router = useRouter();
  const { vendors, isLoading, error, refetch } = useVendors();
  const { deleteVendor, isDeleting } = useDeleteVendor();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Filter vendors based on search
  const filteredVendors = vendors?.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDelete = (vendorId: string) => {
    deleteVendor(vendorId, {
      onSuccess: () => {
        setShowDeleteConfirm(null);
        refetch();
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="text-red-500 text-lg md:text-xl mb-4">
              Error loading vendors
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-2 md:mb-3 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaBuilding className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Vendor Management
                  </h1>
                  <p className="text-sm md:text-base text-blue-100">
                    Manage vendors and their contracts
                  </p>
                </div>
              </div>
              <PermissionGate permission={Permission.ONBOARD_VENDORS}>
                <button
                  onClick={() => router.push("/vendors/new")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
                >
                  <FaPlus /> Add Vendor
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 md:p-6 bg-gray-50">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {filteredVendors && filteredVendors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <FaBuilding className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    {filteredVendors.length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Total Vendors
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <FaCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {filteredVendors.filter((v) => v.is_active === "1").length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Active Vendors
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <FaTimes className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    {filteredVendors.filter((v) => v.is_active === "0").length}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    Inactive Vendors
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl hidden md:block">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Created At</Table.HeaderCell>
                <Table.HeaderCell>Updated At</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredVendors?.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {searchTerm
                    ? "No vendors match your search criteria"
                    : "No vendors found. Create your first vendor!"}
                </Table.Empty>
              ) : (
                filteredVendors?.map((vendor) => (
                  <Table.Row key={vendor.id}>
                    <Table.Cell>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {vendor.code}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium text-gray-900">
                        {vendor.name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.is_active === "1"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vendor.is_active === "1" ? <FaCheck /> : <FaTimes />}
                        {vendor.is_active === "1" ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-sm text-gray-600">
                      {formatDate(vendor.created_at)}
                    </Table.Cell>
                    <Table.Cell className="text-sm text-gray-600">
                      {formatDate(vendor.updated_at)}
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`vendor-${vendor.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(`/vendors/${vendor.code}`)
                            }
                          >
                            <FaEye className="h-4 w-4 text-blue-500" />
                            View Details
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(`/vendors/${vendor.code}/edit`)
                            }
                          >
                            <FaEdit className="h-4 w-4 text-yellow-500" />
                            Edit
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(`/contracts?vendor=${vendor.code}`)
                            }
                          >
                            <FaFileContract className="h-4 w-4 text-purple-500" />
                            Contracts
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => setShowDeleteConfirm(vendor.id)}
                          >
                            <FaTrash className="h-4 w-4 text-red-500" />
                            Delete
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

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredVendors?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              {searchTerm
                ? "No vendors match your search criteria"
                : "No vendors found. Create your first vendor!"}
            </div>
          ) : (
            filteredVendors?.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {vendor.name}
                    </h3>
                    <div className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600 mb-2">
                      {vendor.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.is_active === "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vendor.is_active === "1" ? <FaCheck /> : <FaTimes />}
                      {vendor.is_active === "1" ? "Active" : "Inactive"}
                    </span>
                    <ActionMenu menuId={`vendor-mobile-${vendor.id}`}>
                      <ActionMenu.Trigger />
                      <ActionMenu.Content>
                        <ActionMenu.Item
                          onClick={() => router.push(`/vendors/${vendor.code}`)}
                        >
                          <FaEye className="h-4 w-4 text-blue-500" />
                          View Details
                        </ActionMenu.Item>
                        <ActionMenu.Item
                          onClick={() =>
                            router.push(`/vendors/${vendor.code}/edit`)
                          }
                        >
                          <FaEdit className="h-4 w-4 text-yellow-500" />
                          Edit
                        </ActionMenu.Item>
                        <ActionMenu.Item
                          onClick={() =>
                            router.push(`/contracts?vendor=${vendor.code}`)
                          }
                        >
                          <FaFileContract className="h-4 w-4 text-purple-500" />
                          Contracts
                        </ActionMenu.Item>
                        <ActionMenu.Item
                          onClick={() => setShowDeleteConfirm(vendor.id)}
                        >
                          <FaTrash className="h-4 w-4 text-red-500" />
                          Delete
                        </ActionMenu.Item>
                      </ActionMenu.Content>
                    </ActionMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Created:</span>
                    <p className="text-gray-900 text-xs">
                      {formatDate(vendor.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Updated:</span>
                    <p className="text-gray-900 text-xs">
                      {formatDate(vendor.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Vendor
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this vendor? This action
                  cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDORS}>
      <VendorsContent />
    </PermissionGate>
  );
}
