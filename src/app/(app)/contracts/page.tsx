"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useContracts } from "@/features/vendors/useContracts";
import { useSearchControl } from "@/hooks/useSearchControl";
import { SearchField } from "@/components/common/SearchField";
import { Contract } from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaFileContract, FaPlus } from "react-icons/fa";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";

const CONTRACT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
];

export default function ContractsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const search = useSearchControl(() => setPage(1));

  const { contracts, pagination, isLoading, error } = useContracts({
    // This endpoint has no search param, so filtering is client-side. Drop
    // pagination while searching, or the filter only ever sees one page of
    // contracts and most matches are invisible.
    ...(search.isSearching ? {} : { page, per_page: 25 }),
  });

  // Filter contracts based on search and status
  const term = search.term.toLowerCase();
  const filteredContracts = contracts?.filter((contract: Contract) => {
    if (statusFilter && contract.status !== statusFilter) return false;
    if (!term) return true;

    return (
      contract.vendor.name.toLowerCase().includes(term) ||
      contract.facility.name.toLowerCase().includes(term) ||
      contract.contract_number?.toLowerCase().includes(term)
    );
  });

  // Helper function to format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-";
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
      <div className="min-h-screen p-3 md:p-6">
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
      <ErrorState
        title="Unable to Load Contracts"
        error={error}
        action={{
          label: "Try Again",
          onClick: () => window.location.reload(),
        }}
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
                <FaFileContract className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Contract Management
                </h1>
                <p className="text-sm text-slate-500">
                  Manage vendor facility contracts and services
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search contracts by vendor, facility, or lot..."
              />
            </div>

            <PermissionGate permission={Permission.CREATE_CONTRACTS}>
              <button
                onClick={() => router.push("/contracts/new")}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Contract</span>
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <FaFileContract className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {pagination?.total || 0}
                </div>
                <div className="text-xs text-gray-600">Total Contracts</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <FaFileContract className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {contracts?.filter((c) => c.status === "active").length || 0}
                </div>
                <div className="text-xs text-gray-600">Active Contracts</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <FaFileContract className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {contracts?.filter((c) => c.status === "expired").length || 0}
                </div>
                <div className="text-xs text-gray-600">Expired Contracts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-lg border border-slate-200 hidden md:block overflow-x-auto">
          {filteredContracts?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-xl mb-4">
                {search.isSearching
                  ? "No contracts match your search criteria"
                  : "No contracts found"}
              </div>
              <p className="text-gray-400">
                {search.isSearching
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
                      <ColumnFilter
                        label="Status"
                        options={CONTRACT_STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        allLabel="All Status"
                        searchable={false}
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      className="w-[10%] px-4 py-4"
                      align="center"
                    >
                      Actions
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredContracts?.map((contract: Contract) => (
                    <Table.Row key={contract.id}>
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
                      <Table.Cell className="px-4 py-4" align="center">
                        <ActionMenu menuId={`contract-${contract.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/contracts/${contract.id}`)
                              }
                            >
                              <FaEye className="text-blue-500" /> View Details
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              {/* Pagination */}
              {!search.isSearching && pagination && (
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
              {search.isSearching
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
              {!search.isSearching && pagination && (
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
