"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useLots } from "@/features/lots/useLots";
import { Lot } from "@/services/apiLots";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaLayerGroup,
  FaPlus,
  FaFilter,
  FaEye,
  FaStethoscope,
  FaEdit,
  FaCogs,
  FaTrash,
} from "react-icons/fa";
import { ActionMenu } from "@/components/ActionMenu";
import { SearchField } from "@/components/SearchField";

export default function LotsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const { lots, isLoading, error } = useLots();

  // Filter lots based on search and status
  const filteredLots = lots?.filter((lot: Lot) => {
    const matchesSearch =
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && lot.is_active) ||
      (statusFilter === "inactive" && !lot.is_active);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading lots...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <p className="text-red-600">
                Error loading lots: {error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaLayerGroup className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Lot Management
                  </h1>
                  <p className="text-sm md:text-base text-indigo-100">
                    Manage service lots and categories
                  </p>
                </div>
              </div>
              <PermissionGate permission={Permission.ONBOARD_LOTS}>
                <button
                  onClick={() => router.push("/lots/new")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Lot</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 md:p-6 bg-gray-50 border-b space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search lots by name or number..."
              />
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaLayerGroup className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {lots?.length || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Lots
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaLayerGroup className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {lots?.filter((l) => l.is_active).length || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Lots
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaStethoscope className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  --
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Available Services
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl hidden md:block">
          {filteredLots?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-xl mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No lots match your search criteria"
                  : "No lots found"}
              </div>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "Create your first lot to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Lot Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Lot Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLots?.map((lot: Lot) => (
                    <tr
                      key={lot.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-medium text-gray-900">
                          LOT {lot.number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {lot.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            lot.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {lot.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu menuId={`lot-${lot.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() => {
                                router.push(`/lots/${lot.id}`);
                              }}
                            >
                              <FaEye className="w-4 h-4" />
                              View Details
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => {
                                router.push(`/lots/${lot.id}/edit`);
                              }}
                            >
                              <FaEdit className="w-4 h-4" />
                              Edit
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => {
                                router.push(`/lots/${lot.id}/services`);
                              }}
                            >
                              <FaCogs className="w-4 h-4" />
                              Manage Services
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => {
                                // Handle delete action - you might want to add a delete hook/modal
                                console.log("Delete lot:", lot.id);
                              }}
                            >
                              <FaTrash className="w-4 h-4 text-red-500" />
                              Delete
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredLots?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No lots match your search criteria"
                : "No lots found. Create your first lot!"}
            </div>
          ) : (
            filteredLots?.map((lot: Lot) => (
              <div
                key={lot.id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {lot.name}
                    </h3>
                    <div className="text-sm text-gray-500 font-mono">
                      LOT {lot.number}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lot.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lot.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <ActionMenu menuId={`lot-mobile-${lot.id}`}>
                    <ActionMenu.Trigger />
                    <ActionMenu.Content>
                      <ActionMenu.Item
                        onClick={() => {
                          router.push(`/lots/${lot.id}`);
                        }}
                      >
                        <FaEye className="w-4 h-4" />
                        View Details
                      </ActionMenu.Item>
                      <ActionMenu.Item
                        onClick={() => {
                          router.push(`/lots/${lot.id}/edit`);
                        }}
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
                      </ActionMenu.Item>
                      <ActionMenu.Item
                        onClick={() => {
                          router.push(`/lots/${lot.id}/services`);
                        }}
                      >
                        <FaCogs className="w-4 h-4" />
                        Manage Services
                      </ActionMenu.Item>
                      <ActionMenu.Item
                        onClick={() => {
                          // Handle delete action
                          console.log("Delete lot:", lot.id);
                        }}
                      >
                        <FaTrash className="w-4 h-4 text-red-500" />
                        Delete
                      </ActionMenu.Item>
                    </ActionMenu.Content>
                  </ActionMenu>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Number:</span>
                    <p className="text-gray-900 font-mono">LOT {lot.number}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
