"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useContracts } from "@/features/vendors/useContracts";
import { Contract } from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaFileContract, FaPlus, FaSearch } from "react-icons/fa";
import { Table } from "@/components/Table";
import Pagination from "@/components/common/Pagination";

export default function ContractsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { contracts, pagination, isLoading, error } = useContracts({
    page,
    per_page: 25,
  });

  // Filter contracts based on search
  const filteredContracts = contracts?.filter((contract: Contract) => {
    const matchesSearch =
      contract.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return statusStyles[status] || statusStyles.inactive;
  };

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
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-2 md:mb-3">
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
          <div className="p-4 md:p-6 bg-gray-50 space-y-4">
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
                  {pagination?.total || 0}
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
                  {contracts?.filter((c) => c.status === "active").length || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Contracts
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {contracts?.filter((c) => c.status === "expired").length || 0}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Expired Contracts
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl hidden md:block overflow-x-auto">
          {filteredContracts?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-xl mb-4">
                {searchTerm
                  ? "No contracts match your search criteria"
                  : "No contracts found"}
              </div>
              <p className="text-gray-400">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first contract to get started"}
              </p>
            </div>
          ) : (
            <>
              <Table className="w-full table-fixed">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="w-[15%] px-6 py-4">
                      Contract #
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[20%] px-6 py-4">
                      Vendor
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[25%] px-6 py-4">
                      Facility
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[15%] px-4 py-4">
                      Start Date
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[15%] px-4 py-4">
                      End Date
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[10%] px-4 py-4">
                      Status
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[10%] px-4 py-4">
                      Status
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredContracts?.map((contract: Contract) => (
                    <Table.Row
                      key={contract.id}
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <Table.Cell className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-900">
                          {contract.contract_number || contract.id.slice(0, 8)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 !whitespace-normal">
                        <div className="min-w-0 max-w-full overflow-hidden">
                          <div className="font-medium text-gray-900 break-words leading-relaxed">
                            {contract.vendor.name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono mt-1 break-all">
                            {contract.vendor.code}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 !whitespace-normal">
                        <div className="min-w-0 max-w-full overflow-hidden">
                          <div className="font-medium text-gray-900 break-words leading-relaxed">
                            {contract.facility.name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono mt-1 break-all">
                            {contract.facility.code}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <span className="text-sm text-gray-900">
                          {formatDate(contract.start_date)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <span className="text-sm text-gray-900">
                          {formatDate(contract.end_date)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                            contract.status,
                          )}`}
                        >
                          {contract.status}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {pagination && (
                <div className="bg-white px-4 py-3 border-t border-gray-200">
                  <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    total={pagination.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredContracts?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              {searchTerm
                ? "No contracts match your search criteria"
                : "No contracts found. Create your first contract!"}
            </div>
          ) : (
            <>
              {filteredContracts?.map((contract: Contract) => (
                <div
                  key={contract.id}
                  className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 cursor-pointer"
                  onClick={() => router.push(`/contracts/${contract.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-xs font-mono text-gray-500 mb-1">
                        {contract.contract_number || contract.id.slice(0, 8)}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {contract.vendor.name}
                      </h3>
                      <div className="text-sm text-gray-500 font-mono">
                        {contract.vendor.code}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                        contract.status,
                      )}`}
                    >
                      {contract.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 font-medium">
                        Facility:
                      </span>
                      <p className="text-gray-900">{contract.facility.name}</p>
                      <p className="text-gray-500 font-mono text-xs">
                        {contract.facility.code}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-500 font-medium">
                          Start Date:
                        </span>
                        <p className="text-gray-900">
                          {formatDate(contract.start_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">
                          End Date:
                        </span>
                        <p className="text-gray-900">
                          {formatDate(contract.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination for Mobile */}
              {pagination && (
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    total={pagination.total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
