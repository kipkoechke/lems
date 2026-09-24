"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaMoneyBillWave,
  FaUserInjured,
  FaCog,
  FaStopwatch,
  FaXRay,
} from "react-icons/fa";
import StatCard from "@/components/common/StatCard";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardSkeleton } from "@/components/common/Skeleton";
import { useCurrentFacility } from "@/hooks/useAuth";
import { useBookingsWithPagination } from "@/features/services/bookings/useBookings";
import { useWorklist } from "@/features/worklist/useWorklist";
import { useHasPermission } from "@/hooks/usePermissions";
import { Permission } from "@/lib/rbac";
import { maskPhoneNumber } from "@/lib/maskUtils";
import type { Booking } from "@/types/booking";
import { facilityDashboardFilters } from "./facilityDashboardQuery";
import { ConnectivityCard } from "@/components/common/ConnectivityCard";
import { getFacilityDashboard } from "@/services/apiFacilityDashboard";
import { unmatchedStudyCount } from "@/services/apiDashboard";

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
 * `/facility/dashboard` is the source of the headline figures: it is scoped to
 * the caller's facility and to the same equipment population as the facility
 * equipment listing. It replaces the numbers this page used to derive from the
 * booking list's summary block, which was all a facility account could call
 * before the endpoint existed. `/admin/dashboard` still 403s for them.
 *
 * The booking list is still read, but only for the recent-bookings panel.
 */
export default function FacilityDashboard() {
  const router = useRouter();
  const facility = useCurrentFacility();

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["facility-dashboard"],
    queryFn: getFacilityDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, error } = useBookingsWithPagination(
    facilityDashboardFilters(facility?.id),
  );

  // A view-only account has no worklist endpoint, so the panel and its
  // request are both conditional.
  const canSeeWorklist = useHasPermission(Permission.VIEW_WORKLIST);
  const { data: worklist } = useWorklist(
    { per_page: 5 },
    { enabled: canSeeWorklist },
  );

  const bookings: Booking[] = useMemo(() => data?.data ?? [], [data]);
  const pending = worklist?.data ?? [];

  // One skeleton for the whole page: piecemeal placeholders made the header
  // and panels pop in at different moments.
  if (isLoading || dashboardLoading) {
    return <DashboardSkeleton stats={5} withTable />;
  }

  // Only a failure of both leaves nothing to show; either one alone still
  // renders the half it covers.
  if (error && dashboardError) {
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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard
            compact
            title="Bookings"
            mainValue={(dashboard?.bookings.total ?? 0).toLocaleString()}
            subtitle={`${dashboard?.bookings.this_month ?? 0} this month`}
            className="border border-slate-200"
          >
            <FaCalendarAlt className="w-4 h-4 text-blue-500" />
          </StatCard>
          <StatCard
            compact
            title="Studies"
            mainValue={(dashboard?.studies.total ?? 0).toLocaleString()}
            subtitle={`${dashboard?.studies.awaiting_result ?? 0} awaiting result`}
            className="border border-slate-200"
          >
            <FaClipboardList className="w-4 h-4 text-amber-500" />
          </StatCard>
          <StatCard
            compact
            title="Services Done"
            mainValue={(dashboard?.services.completed ?? 0).toLocaleString()}
            subtitle={`${dashboard?.services.completion_rate ?? 0}% completion`}
            className="border border-slate-200"
          >
            <FaCheckCircle className="w-4 h-4 text-emerald-500" />
          </StatCard>
          <StatCard
            compact
            title="Patients"
            mainValue={(dashboard?.bookings.patients ?? 0).toLocaleString()}
            subtitle="Unique"
            className="border border-slate-200"
          >
            <FaUserInjured className="w-4 h-4 text-purple-500" />
          </StatCard>
          <StatCard
            compact
            title="Tariff Value"
            mainValue={money(dashboard?.revenue.tariff)}
            subtitle={`Facility ${money(dashboard?.revenue.facility_share)}`}
            className="border border-slate-200"
          >
            <FaMoneyBillWave className="w-4 h-4 text-green-500" />
          </StatCard>
          <StatCard
            compact
            title="Turnaround"
            mainValue={
              // Null until a study has made the full round trip; that is not
              // the same as zero minutes.
              dashboard?.studies.average_turnaround_minutes == null
                ? "-"
                : `${dashboard.studies.average_turnaround_minutes} min`
            }
            subtitle="Worklist to result"
            className="border border-slate-200"
          >
            <FaStopwatch className="w-4 h-4 text-sky-500" />
          </StatCard>
        </div>

        {/* Equipment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ConnectivityCard
            connectivity={dashboard?.equipment.by_connectivity}
            equipmentHref="/equipments"
            className="lg:col-span-2"
          />

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaCog className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Equipment
              </p>
              <button
                onClick={() => router.push("/equipments")}
                className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(dashboard?.equipment.total ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Owned plus vendor-mapped units
            </p>
            <div className="space-y-1.5">
              {Object.entries(dashboard?.equipment.by_status ?? {})
                .filter(([, count]) => count > 0)
                .map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-500 capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium text-slate-700">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Studies that arrived with no order behind them */}
        {unmatchedStudyCount(dashboard?.unmatched_studies) > 0 && (
          <button
            onClick={() => router.push("/studies/unmatched")}
            className="w-full flex items-center gap-3 bg-white rounded-lg border border-amber-200 px-4 py-3 text-left hover:bg-amber-50 transition-colors"
          >
            <FaXRay className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {unmatchedStudyCount(
                  dashboard?.unmatched_studies,
                ).toLocaleString()}{" "}
                non-SHA stud
                {unmatchedStudyCount(dashboard?.unmatched_studies) === 1
                  ? "y"
                  : "ies"}
              </p>
              <p className="text-xs text-slate-500">
                Reached your machines with no VEMS order behind them
              </p>
            </div>
            <span className="ml-auto text-xs font-medium text-blue-600">
              Review
            </span>
          </button>
        )}

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
          {canSeeWorklist && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">
                  Worklist
                </h2>
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
          )}
        </div>
      </div>
    </div>
  );
}
