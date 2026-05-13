"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCurrentFacility } from "@/hooks/useAuth";
import { useBookingsWithPagination } from "@/features/services/bookings/useBookings";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import {
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
  MdSearch,
  MdAttachMoney,
  MdPeople,
  MdList,
  MdVisibility,
} from "react-icons/md";
import type { Booking, BookingFilters } from "@/types/booking";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending_otp: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  pending_otp: "Pending OTP",
};

export default function ServicesPage() {
  const router = useRouter();
  const facility = useCurrentFacility();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filters: BookingFilters = useMemo(
    () => ({
      facility_id: facility?.id || undefined,
      page,
      per_page: 15,
      search: search || undefined,
      status: status || undefined,
      source: source || undefined,
      from: from || undefined,
      to: to || undefined,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    [facility?.id, page, search, status, source, from, to],
  );

  const { data, isLoading, error } = useBookingsWithPagination(filters);

  const bookings: Booking[] = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded" />
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded" />
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
      <ErrorState
        title="Unable to Load Bookings"
        error={error}
        action={{ label: "Try Again", onClick: () => window.location.reload() }}
        fullScreen
      />
    );
  }

  return (
    <PermissionGate permission={Permission.VIEW_SERVICES}>
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Services</h1>
              <p className="text-sm text-slate-500">
                {pagination?.total ?? 0} bookings
              </p>
            </div>
          </div>

          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                  <MdPeople className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Total Bookings</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.total_bookings.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                  <MdCheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Completed</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.by_status.completed.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                  <MdPending className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Active</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.by_status.active.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center shrink-0">
                  <MdAttachMoney className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Revenue (SHA)</p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {Number(summary.revenue.sha).toLocaleString("en-KE", {
                      style: "currency",
                      currency: "KES",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 relative min-w-[200px]">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search booking number, patient, ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {/* Status */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending_otp">Pending OTP</option>
              </select>
              {/* Source */}
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
              >
                <option value="">All Sources</option>
                <option value="standalone">Standalone</option>
                <option value="hmis">HMIS</option>
                <option value="provider_portal">Provider Portal</option>
              </select>
              {/* Date range */}
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                title="From date"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                title="To date"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-slate-200 hidden md:block overflow-hidden">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Booking #</Table.HeaderCell>
                  <Table.HeaderCell>Patient</Table.HeaderCell>
                  <Table.HeaderCell>Source</Table.HeaderCell>
                  <Table.HeaderCell>Services</Table.HeaderCell>
                  <Table.HeaderCell>Tariff (KES)</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell align="center">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {bookings.length === 0 ? (
                  <Table.Empty colSpan={8}>No bookings found</Table.Empty>
                ) : (
                  bookings.map((booking: Booking) => (
                    <Table.Row key={booking.id}>
                      <Table.Cell>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {booking.booking_number}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="font-medium text-slate-900 text-sm">
                          {booking.patient?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {booking.patient?.identification_no}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="capitalize text-sm text-slate-600">
                          {booking.source?.replace("_", " ") ?? "—"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-900">
                          {booking.services_count ?? 0}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm font-medium text-slate-900">
                          {Number(booking.tariff ?? 0).toLocaleString()}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            STATUS_BADGE[booking.status] ??
                            "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {STATUS_LABEL[booking.status] ?? booking.status}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-slate-500">
                          {new Date(booking.created_at).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <ActionMenu menuId={`booking-${booking.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/bookings/${booking.id}`)
                              }
                            >
                              <MdVisibility className="text-blue-500" /> View
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
                No bookings found
              </div>
            ) : (
              bookings.map((booking: Booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 cursor-pointer"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {booking.booking_number}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_BADGE[booking.status] ??
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {STATUS_LABEL[booking.status] ?? booking.status}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900 text-sm">
                    {booking.patient?.name}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>{booking.services_count ?? 0} services</span>
                    <span>
                      KES {Number(booking.tariff ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MdCalendarToday className="w-3 h-3" />
                      {new Date(booking.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
              ))
            )}
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
      </div>
    </PermissionGate>
  );
}
