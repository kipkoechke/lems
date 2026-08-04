"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useRevenueDistributions } from "@/features/settings/useRevenueDistributions";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import { FaPercent } from "react-icons/fa";

const formatCurrency = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function RevenueDistributionsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { distributions, pagination, isLoading, error, refetch } =
    useRevenueDistributions({
      page,
      per_page: 20,
      search: search || undefined,
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
        title="Unable to Load Revenue Distributions"
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
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaPercent className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Revenue Distributions
                </h1>
                <p className="text-sm text-slate-500">
                  {pagination?.total ?? distributions.length} services with
                  {" "}vendor / facility revenue splits
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full lg:ml-auto">
              <SearchField
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search by service name or code..."
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Service Name</Table.HeaderCell>
                <Table.HeaderCell align="right">Tariff</Table.HeaderCell>
                <Table.HeaderCell align="right">Vendor Share</Table.HeaderCell>
                <Table.HeaderCell align="right">Facility Share</Table.HeaderCell>
                <Table.HeaderCell>Modality</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {distributions.length === 0 ? (
                <Table.Empty colSpan={7}>
                  {search
                    ? "No services match your search"
                    : "No revenue distributions found."}
                </Table.Empty>
              ) : (
                distributions.map((d) => (
                  <Table.Row key={d.id}>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {d.code}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {d.name}
                      </div>
                      {d.capitated && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Capitated
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(d.tariff)}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="text-sm text-emerald-700">
                        {formatCurrency(d.vendor_share)}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="text-sm text-purple-700">
                        {formatCurrency(d.facility_share)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-500">
                        {d.modality || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          d.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {d.is_active ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>

          {pagination && pagination.total_pages > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.total_pages}
              total={pagination.total}
              from={(pagination.current_page - 1) * pagination.per_page + 1}
              to={Math.min(pagination.current_page * pagination.per_page, pagination.total)}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function RevenueDistributionsPage() {
  return (
    <PermissionGate permission={Permission.MANAGE_REVENUE_DISTRIBUTIONS}>
      <RevenueDistributionsContent />
    </PermissionGate>
  );
}
