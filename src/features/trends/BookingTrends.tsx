"use client";

import React, { useMemo } from "react";
import {
  MdPeople,
  MdPrecisionManufacturing,
  MdLocalHospital,
  MdCheckCircle,
  MdAssignment,
  MdMoney,
  MdTrendingUp,
  MdRadio,
} from "react-icons/md";
import { useDashboard } from "./useDashboard";
import { useRouter } from "next/navigation";
import type { ModalityBreakdown } from "@/services/apiDashboard";

const formatCurrency = (value: number) =>
  `KES ${value.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const CLAIM_STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Payment-completed": "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  "clinical-review": "bg-purple-50 text-purple-700 border-purple-200",
};

function StatCard({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function ModalityCard({ modality }: { modality: ModalityBreakdown }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center">
            <MdRadio className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {modality.label}
          </span>
        </div>
        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {modality.count}
        </span>
      </div>
      <div className="space-y-1">
        {modality.categories.slice(0, 5).map((cat) => (
          <div
            key={cat.category}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-slate-500 truncate">{cat.label}</span>
            <span className="text-slate-700 font-medium ml-2">{cat.count}</span>
          </div>
        ))}
        {modality.categories.length > 5 && (
          <p className="text-xs text-slate-400">
            +{modality.categories.length - 5} more
          </p>
        )}
      </div>
    </div>
  );
}

export default function BookingTrends() {
  const router = useRouter();
  const { dashboardData, isLoading, error } = useDashboard();

  const efficiency = dashboardData?.efficiency;
  const recentActivity = dashboardData?.recent_activity || [];
  const modalities = dashboardData?.modalities || [];
  const shaClaims = dashboardData?.sha_claims;

  // Build sha claim status summary
  const claimStatusEntries = useMemo(() => {
    if (!shaClaims?.bookings_by_status) return [];
    return Object.entries(shaClaims.bookings_by_status).sort(
      ([, a], [, b]) => b - a,
    );
  }, [shaClaims]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
          <div className="h-9 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-lg border border-slate-200"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-white rounded-lg border border-slate-200" />
            <div className="h-64 bg-white rounded-lg border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-red-500 text-lg mb-2">
              Error loading dashboard
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {(error as Error)?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { counts } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System overview &amp; key metrics
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <StatCard
            icon={<MdPeople className="w-4 h-4 text-blue-600" />}
            bg="bg-blue-50"
            label="Vendors"
            value={counts.total_vendors}
          />
          <StatCard
            icon={
              <MdPrecisionManufacturing className="w-4 h-4 text-indigo-600" />
            }
            bg="bg-indigo-50"
            label="Equipment"
            value={counts.total_equipment}
          />
          <StatCard
            icon={<MdLocalHospital className="w-4 h-4 text-emerald-600" />}
            bg="bg-emerald-50"
            label="Facilities"
            value={counts.total_facilities}
          />
          <StatCard
            icon={<MdCheckCircle className="w-4 h-4 text-green-600" />}
            bg="bg-green-50"
            label="Completed Studies"
            value={counts.completed_studies}
          />
          <StatCard
            icon={<MdAssignment className="w-4 h-4 text-amber-600" />}
            bg="bg-amber-50"
            label="Active Worklists"
            value={counts.active_worklists}
          />
          <StatCard
            icon={<MdTrendingUp className="w-4 h-4 text-purple-600" />}
            bg="bg-purple-50"
            label="Completion Rate"
            value={`${efficiency?.completion_rate ?? 0}%`}
          />
        </div>

        {/* Equipment Ownership Split */}
        {counts.equipment_by_owner && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
                <MdPrecisionManufacturing className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Vendor Owned</p>
                <p className="text-lg font-bold text-slate-900">
                  {counts.equipment_by_owner.vendor_owned}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center">
                <MdLocalHospital className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Facility Owned</p>
                <p className="text-lg font-bold text-slate-900">
                  {counts.equipment_by_owner.facility_owned}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SHA Claims + Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SHA Claims */}
          {shaClaims && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <MdMoney className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  SHA Claims
                </p>
                <span className="ml-auto text-xs text-slate-400">
                  {shaClaims.total_claims} total
                </span>
              </div>

              {/* Paid / Rejected / Pending */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-700">
                    {shaClaims.paid.count}
                  </p>
                  <p className="text-xs text-emerald-600">Paid</p>
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    {formatCurrency(shaClaims.paid.amount)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-red-700">
                    {shaClaims.rejected.count}
                  </p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-amber-700">
                    {shaClaims.pending.count}
                  </p>
                  <p className="text-xs text-amber-600">Pending</p>
                </div>
              </div>

              {/* Paid breakdown */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-xs">
                  <span className="text-slate-400">Vendor Share:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {formatCurrency(shaClaims.paid.vendor_share)}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400">Facility Share:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {formatCurrency(shaClaims.paid.facility_share)}
                  </span>
                </div>
              </div>

              {/* Claim status breakdown */}
              {claimStatusEntries.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    By Status
                  </p>
                  <div className="space-y-1.5">
                    {claimStatusEntries.map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                            CLAIM_STATUS_BADGES[status] ??
                            "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {status}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Efficiency */}
          {efficiency && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <MdTrendingUp className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Efficiency (Last {efficiency.period_days} Days)
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {efficiency.total_scheduled}
                  </p>
                  <p className="text-xs text-slate-400">Scheduled</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-700">
                    {efficiency.total_completed}
                  </p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">
                    {efficiency.total_cancelled}
                  </p>
                  <p className="text-xs text-slate-400">Cancelled</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-700">
                    {efficiency.completion_rate}%
                  </p>
                  <p className="text-xs text-slate-400">Rate</p>
                </div>
              </div>

              {/* Mini bar chart for daily breakdown */}
              {efficiency.daily_breakdown.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Daily Trend
                  </p>
                  <div className="flex items-end gap-0.5 h-24">
                    {efficiency.daily_breakdown.slice(-14).map((day) => {
                      const maxVal = Math.max(day.scheduled, 1);
                      const completedPct = (day.completed / maxVal) * 100;
                      const cancelledPct = (day.cancelled / maxVal) * 100;
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col justify-end gap-0.5"
                          title={`${day.date}: ${day.completed}/${day.scheduled} completed`}
                        >
                          <div
                            className="w-full bg-emerald-200 rounded-t-sm"
                            style={{ height: `${Math.max(completedPct, 1)}%` }}
                          />
                          {day.cancelled > 0 && (
                            <div
                              className="w-full bg-red-200"
                              style={{
                                height: `${Math.max(cancelledPct, 1)}%`,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-200 rounded-sm inline-block" />{" "}
                      Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-200 rounded-sm inline-block" />{" "}
                      Cancelled
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modalities + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Modalities Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <MdRadio className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Equipment by Modality
              </p>
            </div>
            {modalities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No equipment data
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modalities.map((mod) => (
                  <ModalityCard key={mod.modality} modality={mod} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <MdAssignment className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Recent Activity
              </p>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/bookings/${activity.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">
                          {activity.booking_number}
                        </span>
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                            activity.status === "active"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : activity.status === "completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {activity.patient.name} &middot;{" "}
                        {activity.facility.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400">
                          {formatDate(activity.created_at)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {activity.services_count} services
                        </span>
                        {activity.services_status && (
                          <span className="text-xs flex items-center gap-1">
                            <span className="text-emerald-600">
                              {activity.services_status.completed} done
                            </span>
                            {activity.services_status.pending > 0 && (
                              <span className="text-amber-600">
                                {activity.services_status.pending} pending
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
