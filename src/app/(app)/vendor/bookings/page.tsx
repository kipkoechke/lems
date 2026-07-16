"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import { useVendorBookings } from "@/features/vendors/useVendorBookings";
import { VendorBooking } from "@/services/apiVendors";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ErrorState } from "@/components/common/ErrorState";
import { FaCalendarCheck } from "react-icons/fa";

const STATUS_OPTIONS = [
  { value: "pending_otp", label: "Pending OTP" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending_otp: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatCurrency = (value?: string | null) =>
  value ? `KES ${Number(value).toLocaleString()}` : "-";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function VendorBookingsContent() {
  const { vendorId, isLoading: vendorLoading } = useMyVendor();
  const { bookings, isLoading, error, refetch } = useVendorBookings(vendorId);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // The vendor bookings endpoint returns the full list, so filtering is local.
  const filtered = bookings.filter((b) => {
    if (status && b.status !== status) return false;
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      b.booking_number?.toLowerCase().includes(term) ||
      b.patient?.name?.toLowerCase().includes(term) ||
      b.facility?.name?.toLowerCase().includes(term)
    );
  });

  if (vendorLoading || isLoading) {
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
                <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
                <p className="text-sm text-slate-500">
                  {bookings.length} bookings on your equipment
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search by booking number, patient or facility..."
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 border-b border-slate-100">
            <div className="w-full sm:w-48">
              <SearchableSelect
                label="Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
                placeholder="All Status"
                searchPlaceholder="Search status..."
              />
            </div>
          </div>

          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Booking #</Table.HeaderCell>
                <Table.HeaderCell>Patient</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Services</Table.HeaderCell>
                <Table.HeaderCell>Total Tariff</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.length === 0 ? (
                <Table.Empty colSpan={7}>
                  {search || status
                    ? "No bookings match your criteria"
                    : "No bookings found for your equipment yet"}
                </Table.Empty>
              ) : (
                filtered.map((booking: VendorBooking) => (
                  <Table.Row key={booking.id}>
                    <Table.Cell>
                      <span className="font-mono text-sm text-slate-900">
                        {booking.booking_number}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {booking.patient?.name || "-"}
                      </div>
                      {booking.patient?.identification_no && (
                        <div className="text-xs text-slate-500 font-mono">
                          {booking.patient.identification_no}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm text-slate-900">
                        {booking.facility?.name || "-"}
                      </div>
                      {booking.facility?.fr_code && (
                        <div className="text-xs text-slate-500 font-mono">
                          {booking.facility.fr_code}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {booking.services_count ?? "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(booking.total_tariff)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          STATUS_BADGE[booking.status] ??
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {booking.status?.replace(/_/g, " ")}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-600">
                        {formatDate(booking.created_at)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
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
