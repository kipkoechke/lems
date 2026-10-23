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
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ErrorState } from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { FaCalendarCheck } from "react-icons/fa";
import { equipmentDeviceName } from "@/services/apiEquipment";
import { kes, titleCase } from "@/lib/format";
import {
  VendorServiceStatus,
  serviceDate,
} from "@/features/vendors/vendorServiceStatus";

/**
 * Services booked on the vendor's machines.
 *
 * One row per booked service, which is what the API sends and what a vendor
 * is paid on. The page was titled "Service Requests" under a menu entry
 * called Bookings, and printed the booking's lifecycle flag ("active") over
 * the service's own status; it now carries the menu's name and one status.
 */
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

  const statusOptions = availableFilters.service_status.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  if (error) {
    return (
      <ErrorState
        title="Unable to load bookings"
        error={error}
        action={{ label: "Try again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  const filtering = search.isSearching || !!serviceStatus;
  const empty = filtering
    ? "No bookings match your search"
    : "No services have been booked on your machines yet";

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
                <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
                <p className="text-sm text-slate-500">
                  {pagination.total.toLocaleString()}{" "}
                  {pagination.total === 1 ? "service" : "services"} booked on
                  your machines
                  {summary.not_started > 0 && (
                    <span className="text-amber-700">
                      {" "}
                      · {summary.not_started.toLocaleString()} not started
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full lg:ml-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search booking, accession, patient or facility..."
              />
            </div>
          </div>

          {/* The status filter lives in the column header on a desktop. */}
          {statusOptions.length > 0 && (
            <div className="md:hidden mt-3">
              <SearchableSelect
                label=""
                compact
                value={serviceStatus}
                onChange={(v) => {
                  setServiceStatus(v);
                  setPage(1);
                }}
                placeholder="All statuses"
                options={statusOptions}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Desktop */}
          <div className="hidden md:block">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Service</Table.HeaderCell>
                  <Table.HeaderCell>Patient</Table.HeaderCell>
                  <Table.HeaderCell>Facility</Table.HeaderCell>
                  <Table.HeaderCell>Machine</Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Status"
                      options={statusOptions}
                      value={serviceStatus}
                      onChange={(v) => {
                        setServiceStatus(v);
                        setPage(1);
                      }}
                      allLabel="All statuses"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell align="right">Your share</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Loading colSpan={6} rows={8} />
                ) : bookings.length === 0 ? (
                  <Table.Empty colSpan={6}>{empty}</Table.Empty>
                ) : (
                  bookings.map((item: VendorBookingItem) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        <div className="font-medium text-slate-900">
                          {item.service?.name ?? "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="font-mono">
                            {item.booking.booking_number}
                          </span>{" "}
                          · {serviceDate(item.booking.created_at)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {item.patient?.name ?? "—"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-slate-900 max-w-[16rem] truncate">
                          {titleCase(item.facility?.name ?? "—")}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {item.facility?.fr_code}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-slate-900 max-w-[12rem] truncate">
                          {equipmentDeviceName(item.equipment?.name)}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {item.worklist?.accession_number ??
                            item.equipment?.code}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <VendorServiceStatus status={item.status} />
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {kes(item.vendor_share)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Phone: one card per service */}
          <div className="md:hidden divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded bg-slate-100" />
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">{empty}</p>
            ) : (
              bookings.map((item: VendorBookingItem) => (
                <div key={item.id} className="p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900">
                      {item.service?.name ?? "—"}
                    </p>
                    <VendorServiceStatus status={item.status} />
                  </div>
                  <p className="text-sm text-slate-700">
                    {titleCase(item.facility?.name ?? "—")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.patient?.name} ·{" "}
                    {equipmentDeviceName(item.equipment?.name)}
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-slate-500">
                      <span className="font-mono">
                        {item.booking.booking_number}
                      </span>{" "}
                      · {serviceDate(item.booking.created_at)}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {kes(item.vendor_share)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

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
