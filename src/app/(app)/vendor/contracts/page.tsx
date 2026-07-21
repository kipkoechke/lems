"use client";

import { useState } from "react";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useVendorContracts } from "@/features/vendors/useVendorContracts";
import { contractLot, VendorContract } from "@/services/apiVendorContracts";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { ErrorState } from "@/components/common/ErrorState";
import { FaEye, FaFileContract } from "react-icons/fa";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function VendorContractsContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const search = useSearchControl(() => setPage(1));

  const { contracts, summary, pagination, isLoading, error, refetch } =
    useVendorContracts({
      // This endpoint has no search param, so filtering is client-side. Drop
      // pagination while searching, or the filter only ever sees one page of
      // contracts and most matches are invisible.
      ...(search.isSearching ? {} : { page, per_page: 15 }),
      status: status || undefined,
    });

  const filtered = contracts.filter((c: VendorContract) => {
    const term = search.term.toLowerCase();
    if (!term) return true;
    return (
      c.contract_number?.toLowerCase().includes(term) ||
      c.facility?.name?.toLowerCase().includes(term) ||
      contractLot(c)?.name?.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
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
        title="Unable to Load Contracts"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  const stats = [
    { label: "Total Contracts", value: summary?.total ?? pagination?.total },
    { label: "Active", value: summary?.active },
    { label: "Expired", value: summary?.expired },
    { label: "Facilities", value: summary?.facilities },
  ].filter((s) => s.value !== undefined);

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
                <h1 className="text-xl font-bold text-slate-900">Contracts</h1>
                <p className="text-sm text-slate-500">
                  {summary?.total ?? pagination?.total ?? contracts.length}{" "}
                  contracts
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search by contract number, facility or lot..."
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-lg border border-slate-200 p-3"
              >
                <div className="text-lg font-bold text-slate-900">
                  {s.value}
                </div>
                <div className="text-xs text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Contract #</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Lot</Table.HeaderCell>
                <Table.HeaderCell>Period</Table.HeaderCell>
                <Table.HeaderCell>Services</Table.HeaderCell>
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
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Empty colSpan={7}>
                  {search.isSearching || status
                    ? "No contracts match your criteria"
                    : "No contracts found for your vendor yet."}
                </Table.Empty>
              ) : (
                filtered.map((c) => (
                  <Table.Row key={c.id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-slate-900">
                        {c.contract_number || c.id.slice(0, 8)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {c.facility?.name || "-"}
                      </div>
                      {(c.facility?.code || c.facility?.fr_code) && (
                        <div className="text-xs text-slate-500 font-mono">
                          {c.facility.code ?? c.facility.fr_code}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {contractLot(c)?.name || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatDate(c.start_date)} – {formatDate(c.end_date)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {c.services_count ?? "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          STATUS_BADGE[c.status] ??
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`vendor-contract-${c.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() =>
                              router.push(`/vendor/contracts/${c.id}`)
                            }
                          >
                            <FaEye className="text-blue-500" /> View Details
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

export default function VendorContractsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_CONTRACTS}>
      <VendorContractsContent />
    </PermissionGate>
  );
}
