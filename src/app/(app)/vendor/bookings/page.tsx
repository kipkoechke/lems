"use client";

import { useState } from "react";
import { useSearchControl } from "@/hooks/useSearchControl";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useVendorBookingsPaginated } from "@/features/vendors/useVendorBookings";
import type { VendorBookingItem } from "@/types/booking";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { ErrorState } from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { FaCalendarCheck } from "react-icons/fa";

const SERVICE_STATUS_BADGE: Record<string, string> = {
  not_started: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const formatCurrency = (value?: string | null) =>
  value ? `KES ${Number(value).toLocaleString()}` : "-";

function VendorBookingsContent() {
  const [page, setPage] = useState(1);
  const [serviceStatus, setServiceStatus] = useState("");
  const search = useSearchControl(() => setPage(1));

  const {
    summary,
    bookings,
    pagination,
    availableFilters,
    isLoading,
    error,
    refetch,
  } = useVendorBookingsPaginated({
    // Searching is unpaginated so results span all bookings rather than being
    // capped at one page of matches.
    ...(search.isSearching ? {} : { page, per_page: 20 }),
    service_status: serviceStatus || undefined,
    search: search.term || undefined,
  });

  // Map available_filters to ColumnFilter options
  const serviceStatusOptions = availableFilters.service_status.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(8)].map((_, i) => (
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
        title="Unable to Load Bookings"
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCalendarCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Service Requests</h1>
                <p className="text-sm text-slate-500">
                  {pagination.total} total
                  {summary.not_started > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">
                      · {summary.not_started} pending
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search by booking number, accession number, patient or facility..."
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Booking #</Table.HeaderCell>
                <Table.HeaderCell>Accession #</Table.HeaderCell>
                <Table.HeaderCell>Patient</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>
                  <ColumnFilter
                    label="Status"
                    options={serviceStatusOptions}
                    value={serviceStatus}
                    onChange={(v) => {
                      setServiceStatus(v);
                      setPage(1);
                    }}
                    allLabel="All Status"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Modality</Table.HeaderCell>
                <Table.HeaderCell>Equipment</Table.HeaderCell>
                <Table.HeaderCell align="right">Vendor Share</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {bookings.length === 0 ? (
                <Table.Empty colSpan={8}>
                  {search.isSearching || serviceStatus
                    ? "No service requests match your criteria"
                    : "No service requests found yet"}
                </Table.Empty>
              ) : (
                bookings.map((item: VendorBookingItem) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-slate-900">
                        {item.booking.booking_number}
                      </span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.booking.status}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-mono text-sm text-slate-700">
                        {item.worklist.accession_number}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-900">
                        {item.patient.name}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {item.facility.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {item.facility.fr_code}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          SERVICE_STATUS_BADGE[item.status] ??
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {item.modality}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900 max-w-[200px] truncate">
                        {item.equipment.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {item.equipment.code}
                      </div>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(item.vendor_share)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>

        {/* Pagination */}
        {!search.isSearching && pagination.total_pages > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.total_pages}
            total={pagination.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

export default function VendorBookingsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_BOOKINGS}>
      <VendorBookingsContent />
    </PermissionGate>
  );
}
