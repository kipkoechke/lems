"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaMoneyBillWave,
  FaUserInjured,
} from "react-icons/fa";
import StatCard from "@/components/common/StatCard";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardSkeleton } from "@/components/common/Skeleton";
import { useCurrentFacility } from "@/hooks/useAuth";
import { useBookingsWithPagination } from "@/features/services/bookings/useBookings";
import { useWorklist } from "@/features/worklist/useWorklist";
import { maskPhoneNumber } from "@/lib/maskUtils";
import type { Booking } from "@/types/booking";
import { facilityDashboardFilters } from "./facilityDashboardQuery";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending_otp: "bg-amber-50 text-amber-700 border-amber-200",
};

const money = (value?: string | number | null) =>
  Number(value ?? 0).toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

/**
 * Dashboard for facility roles.
 *
 * It deliberately avoids `/admin/dashboard`: the API returns 403 for facility
 * accounts despite the reference listing it as their "Facility dashboard".
 * Everything here is built from endpoints a facility account can actually call
 * — the booking list's own summary block, and the worklist.
 */
export default function FacilityDashboard() {
  const router = useRouter();
  const facility = useCurrentFacility();

  const { data, isLoading, error } = useBookingsWithPagination(
    facilityDashboardFilters(facility?.id),
  );

  const { data: worklist } = useWorklist({ per_page: 5 });

  const summary = data?.summary;
  const bookings: Booking[] = useMemo(() => data?.data ?? [], [data]);
  const pending = worklist?.data ?? [];

  // One skeleton for the whole page: piecemeal placeholders made the header
  // and panels pop in at different moments.
  if (isLoading) {
    return <DashboardSkeleton stats={5} withTable />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Dashboard"
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
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            {facility?.name || "Facility"} Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Bookings and services at your facility
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard
              compact
              title="Total Bookings"
              mainValue={(summary?.total_bookings ?? 0).toLocaleString()}
              subtitle="All time"
              className="border border-slate-200"
            >
              <FaCalendarAlt className="w-4 h-4 text-blue-500" />
            </StatCard>
            <StatCard
              compact
              title="Active"
              mainValue={(summary?.by_status?.active ?? 0).toLocaleString()}
              subtitle="In progress"
              className="border border-slate-200"
            >
              <FaClipboardList className="w-4 h-4 text-amber-500" />
            </StatCard>
            <StatCard
              compact
              title="Completed"
              mainValue={(summary?.by_status?.completed ?? 0).toLocaleString()}
              subtitle="Services done"
              className="border border-slate-200"
            >
              <FaCheckCircle className="w-4 h-4 text-emerald-500" />
            </StatCard>
            <StatCard
              compact
              title="Patients"
              mainValue={(summary?.unique_patients ?? 0).toLocaleString()}
              subtitle="Unique"
              className="border border-slate-200"
            >
              <FaUserInjured className="w-4 h-4 text-purple-500" />
            </StatCard>
            <StatCard
              compact
              title="Tariff Value"
              mainValue={money(summary?.revenue?.tariff)}
              subtitle={`SHA ${money(summary?.revenue?.sha)}`}
              className="border border-slate-200"
            >
              <FaMoneyBillWave className="w-4 h-4 text-green-500" />
            </StatCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Recent bookings */}
          <div className="xl:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Bookings
              </h2>
              <button
                onClick={() => router.push("/services")}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Booking #</Table.HeaderCell>
                    <Table.HeaderCell>Patient</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {bookings.length === 0 ? (
                    <Table.Empty colSpan={4}>No bookings yet</Table.Empty>
                  ) : (
                    bookings.map((booking) => (
                      <Table.Row
                        key={booking.id}
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
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
                          {formatDate(
                            booking.booking_date || booking.created_at,
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                              STATUS_BADGE[booking.status] ||
                              "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {booking.status?.replace(/_/g, " ")}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>

          {/* Worklist preview */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Worklist</h2>
              <button
                onClick={() => router.push("/practitioner/worklist")}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Open
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {pending.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-500 text-center">
                  Nothing on the worklist
                </p>
              ) : (
                pending.slice(0, 5).map((item) => (
                  <div key={item.id} className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {item.patient?.name || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.booking_number} ·{" "}
                      {item.services?.length ?? item.services_count ?? 0}{" "}
                      service(s)
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
