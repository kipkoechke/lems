"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useContracts } from "@/features/vendors/useContracts";
import { Contract } from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaFileContract,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEye,
  FaBuilding,
  FaUserTie,
  FaBox,
} from "react-icons/fa";

export default function ContractsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const { contracts, isLoading, error } = useContracts();

  // Filter contracts based on search and status
  const filteredContracts = contracts?.filter((contract: Contract) => {
    const matchesSearch =
      contract.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.lot.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && contract.is_active === "1") ||
      (statusFilter === "inactive" && contract.is_active === "0");

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading contracts...</p>
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <p className="text-red-600">
                Error loading contracts: {error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Contract Management
                  </h1>
                  <p className="text-sm md:text-base text-purple-100">
                    Manage vendor facility contracts and services
                  </p>
                </div>
              </div>
              <PermissionGate permission={Permission.CREATE_CONTRACTS}>
                <button
                  onClick={() => router.push("/contracts/new")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Contract</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 md:p-6 bg-gray-50 border-b space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contracts by vendor, facility, or lot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {contracts?.length || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Contracts
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {contracts?.filter((c) => c.is_active === "1").length || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Contracts
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {contracts?.reduce(
                    (sum, c) => sum + (c.services?.length || 0),
                    0
                  ) || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Services
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl hidden md:block">
          {filteredContracts?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-xl mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No contracts match your search criteria"
                  : "No contracts found"}
              </div>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "Create your first contract to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Vendor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Facility
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Lot
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Services
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
                  {filteredContracts?.map((contract: Contract) => (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaUserTie className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {contract.vendor.name}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {contract.vendor.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FaBuilding className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {contract.facility.name}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {contract.facility.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FaBox className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              LOT {contract.lot.number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contract.lot.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {contract.services?.length || 0} services
                          </span>
                          <span className="text-sm text-gray-500">
                            (
                            {contract.services?.filter(
                              (s) => s.is_active === "1"
                            ).length || 0}{" "}
                            active)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            contract.is_active === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {contract.is_active === "1" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/contracts/${contract.id}`);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
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
          {filteredContracts?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No contracts match your search criteria"
                : "No contracts found. Create your first contract!"}
            </div>
          ) : (
            filteredContracts?.map((contract: Contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 cursor-pointer"
                onClick={() => router.push(`/contracts/${contract.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {contract.vendor.name}
                    </h3>
                    <div className="text-sm text-gray-500 font-mono">
                      {contract.vendor.code}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      contract.is_active === "1"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {contract.is_active === "1" ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Facility:</span>
                    <p className="text-gray-900">{contract.facility.name}</p>
                    <p className="text-gray-500 font-mono text-xs">
                      {contract.facility.code}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 font-medium">Lot:</span>
                      <p className="text-gray-900">LOT {contract.lot.number}</p>
                      <p className="text-gray-500 text-xs">
                        {contract.lot.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">
                        Services:
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {contract.services?.length || 0} total
                        </span>
                      </div>
                    </div>
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
