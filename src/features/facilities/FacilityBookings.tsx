"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaEye } from "react-icons/fa";
import { Table } from "@/components/Table";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useBookingsWithPagination } from "@/features/services/bookings/useBookings";
import { maskPhoneNumber } from "@/lib/maskUtils";
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

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

interface FacilityBookingsProps {
  facilityId: string;
}

/** Bookings made at a single facility, for the facility details page. */
export default function FacilityBookings({
  facilityId,
}: FacilityBookingsProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const search = useSearchControl(() => setPage(1));

  const filters: BookingFilters = useMemo(
    () => ({
      facility_id: facilityId,
      // Searching is unpaginated so results span the whole booking history for
      // this facility rather than being capped at one page of matches.
      ...(search.isSearching ? {} : { page, per_page: 10 }),
      search: search.term || undefined,
      status: status || undefined,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    [facilityId, page, search.term, search.isSearching, status],
  );

  const { data, isLoading, error } = useBookingsWithPagination(filters);

  const bookings: Booking[] = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  if (error) {
    return (
      <div className="p-6 text-center text-sm text-red-600">
        Failed to load bookings for this facility.
      </div>
    );
  }

  return (
    <div>
      {/* Summary + filters */}
      <div className="p-4 border-b border-slate-100 space-y-3">
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Total", value: summary.total_bookings },
              { label: "Active", value: summary.by_status?.active },
              { label: "Completed", value: summary.by_status?.completed },
              { label: "Patients", value: summary.unique_patients },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {(stat.value ?? 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchField
              value={search.input}
              onChange={search.onInputChange}
              onSearch={search.submit}
              onClear={search.clear}
              placeholder="Search booking number, patient, ID..."
            />
          </div>
          <SearchableSelect
            label=""
            compact
            className="min-w-[150px]"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            placeholder="All Statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "pending_otp", label: "Pending OTP" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="w-full">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Booking #</Table.HeaderCell>
              <Table.HeaderCell>Patient</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Services</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell align="center">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Loading colSpan={6} rows={4} />
            ) : bookings.length === 0 ? (
              <Table.Empty colSpan={6}>
                <div className="flex flex-col items-center gap-2">
                  <FaCalendarAlt className="w-5 h-5 text-slate-300" />
                  <span className="text-sm text-slate-500">
                    {search.term || status
                      ? "No bookings match these filters."
                      : "No bookings have been made at this facility yet."}
                  </span>
                </div>
              </Table.Empty>
            ) : (
              bookings.map((booking) => (
                <Table.Row key={booking.id}>
                  <Table.Cell>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                      {booking.booking_number}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="font-medium text-slate-900">
                      {booking.patient?.name || "-"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {booking.patient?.phone
                        ? maskPhoneNumber(booking.patient.phone)
                        : "-"}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {formatDate(booking.booking_date || booking.created_at)}
                  </Table.Cell>
                  <Table.Cell>
                    {booking.services_count ?? booking.services?.length ?? 0}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_BADGE[booking.status] ||
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {STATUS_LABEL[booking.status] || booking.status}
                    </span>
                  </Table.Cell>
                  <Table.Cell align="center">
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <FaEye className="w-3.5 h-3.5" /> View
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {pagination && !search.isSearching && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          from={pagination.from}
          to={pagination.to}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
