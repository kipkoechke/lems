"use client";

import React, { useMemo, useState } from "react";
import {
  MdPeople,
  MdPrecisionManufacturing,
  MdLocalHospital,
  MdCheckCircle,
  MdAssignment,
  MdMoney,
  MdTrendingUp,
  MdRadio,
  MdLink,
} from "react-icons/md";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useDashboard } from "./useDashboard";
import { DashboardSkeleton } from "@/components/common/Skeleton";
import { ConnectivityCard } from "@/components/common/ConnectivityCard";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { BookingTrendChart } from "@/components/common/BookingTrendChart";
import { useRouter } from "next/navigation";
import { unmatchedStudyCount } from "@/services/apiDashboard";
import type {
  DashboardAvailableFilters,
  DashboardParams,
} from "@/services/apiDashboard";

const formatCurrency = (value: number) =>
  `KES ${value.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ===== Donut Chart Colors =====
const DONUT_COLORS = {
  equipment: ["#6366f1", "#10b981"], // indigo, emerald
  linkage: ["#8b5cf6", "#e2e8f0"], // violet, slate
  sha: ["#10b981", "#ef4444", "#f59e0b"], // emerald, red, amber
  efficiency: ["#10b981", "#ef4444", "#3b82f6"], // emerald, red, blue (completed, cancelled, remaining)
};

// ===== Donut Chart Component =====
function DonutCard({
  title,
  icon,
  data,
  colors,
  centerLabel,
  centerValue,
  legendItems,
  emptyMessage = "No data yet",
}: {
  title: string;
  icon: React.ReactNode;
  data: { name: string; value: number }[];
  colors: string[];
  centerLabel?: string;
  centerValue?: string | number;
  legendItems?: { label: string; value: string | number; color: string }[];
  emptyMessage?: string;
}) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <span className="text-slate-400">{icon}</span>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </p>
      </div>
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8 h-28">
          <span className="text-sm font-medium text-slate-500">
            {emptyMessage}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">
            Data will appear here once available
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-4">
        <div className="relative w-28 h-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={colors[idx % colors.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue !== undefined && (
              <span className="text-lg font-bold text-slate-900">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[10px] text-slate-400 leading-tight text-center">
                {centerLabel}
              </span>
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {legendItems?.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-1.5 text-slate-500 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-medium text-slate-700 ml-2">
                {item.value}
              </span>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  bg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string | number;
  sub?: string;
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
        <p className="text-sm font-medium text-slate-900 truncate">
          {value}
          {sub && (
            <span className="text-xs text-slate-400 font-normal ml-1">
              {sub}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * Dashboard filter bar.
 *
 * Every dropdown is driven by the `filters.available` block the dashboard
 * itself returns, so a filter only appears when the API offers options for it
 * — no separate county/facility/vendor lookups, and no stale hardcoded lists.
 */
function DashboardFilterBar({
  available,
  filters,
  onChange,
  onReset,
}: {
  available?: DashboardAvailableFilters;
  filters: DashboardParams;
  onChange: (key: keyof DashboardParams, value: string) => void;
  onReset: () => void;
}) {
  type Field = {
    key: keyof DashboardParams;
    label: string;
    options?: { value: string; label: string }[];
  };

  const fields: Field[] = ([
    { key: "period", label: "All time", options: available?.period },
    { key: "county_id", label: "All counties", options: available?.county },
    {
      key: "facility_type",
      label: "All facility types",
      options: available?.facility_type,
    },
    { key: "keph_level", label: "All KEPH levels", options: available?.keph_level },
    { key: "facility_id", label: "All facilities", options: available?.facility },
    { key: "vendor_id", label: "All vendors", options: available?.vendor },
  ] as Field[]).filter((field) => field.options && field.options.length > 0);

  if (fields.length === 0) return null;

  const hasFilters = fields.some((field) => filters[field.key]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {fields.map((field) => (
        <SearchableSelect
          key={field.key}
          label=""
          compact
          className="w-44"
          value={(filters[field.key] as string) ?? ""}
          onChange={(value) => onChange(field.key, value)}
          placeholder={field.label}
          searchPlaceholder="Search..."
          options={field.options!}
        />
      ))}
      {hasFilters && (
        <button
          onClick={onReset}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Clear
        </button>
      )}
    </div>
  );
}

const MODALITY_BAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export default function BookingTrends() {
  const router = useRouter();
  const [filters, setFilters] = useState<DashboardParams>({});
  const { dashboardData, isLoading, isFetching, error } = useDashboard(filters);

  const setFilter = (key: keyof DashboardParams, value: string) =>
    setFilters((current) => ({ ...current, [key]: value || undefined }));

  const efficiency = dashboardData?.efficiency;
  const bookingTrend = dashboardData?.booking_trend;
  const availableFilters = dashboardData?.filters?.available;
  const modalities = dashboardData?.modalities || [];
  const shaClaims = dashboardData?.sha_claims;

  // Equipment ownership donut data
  const equipmentDonutData = useMemo(() => {
    const eo = dashboardData?.counts?.equipment_by_owner;
    if (!eo) return [];
    return [
      { name: "Vendor Owned", value: eo.vendor_owned },
      { name: "Facility Owned", value: eo.facility_owned },
    ];
  }, [dashboardData]);

  // Equipment linkage donut data
  const equipmentLinkageData = useMemo(() => {
    const el = dashboardData?.counts?.equipment_by_linkage;
    if (!el) return [];
    return [
      { name: "Linked", value: el.linked },
      { name: "Not Linked", value: el.not_linked },
    ];
  }, [dashboardData]);

  // SHA claims donut data (paid / rejected / pending)
  const shaDonutData = useMemo(() => {
    if (!shaClaims) return [];
    return [
      { name: "Paid", value: shaClaims.paid.count },
      { name: "Rejected", value: shaClaims.rejected.count },
      { name: "Pending", value: shaClaims.pending.count },
    ];
  }, [shaClaims]);

  // Efficiency donut data (completed vs cancelled vs remaining)
  const efficiencyDonutData = useMemo(() => {
    if (!efficiency) return [];
    const remaining =
      efficiency.total_scheduled -
      efficiency.total_completed -
      efficiency.total_cancelled;
    return [
      { name: "Completed", value: efficiency.total_completed },
      { name: "Cancelled", value: efficiency.total_cancelled },
      ...(remaining > 0
        ? [{ name: "Remaining", value: remaining }]
        : []),
    ];
  }, [efficiency]);

  // Modality bar chart data
  const modalityBarData = useMemo(() => {
    return modalities.map((m) => ({
      name: m.label,
      count: m.count,
      modality: m.modality,
    }));
  }, [modalities]);

  if (isLoading) {
    return <DashboardSkeleton stats={5} panels={3} />;
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen p-4">
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
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              System overview &amp; key metrics
              {isFetching && !isLoading && " — updating…"}
            </p>
          </div>
          <DashboardFilterBar
            available={availableFilters}
            filters={filters}
            onChange={setFilter}
            onReset={() => setFilters({})}
          />
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
            sub={
              efficiency
                ? `· ${efficiency.completion_rate}% rate`
                : undefined
            }
          />
          <StatCard
            icon={<MdAssignment className="w-4 h-4 text-amber-600" />}
            bg="bg-amber-50"
            label="Active Worklists"
            value={counts.active_worklists}
          />
          {counts.equipment_by_linkage && (
            <StatCard
              icon={<MdLink className="w-4 h-4 text-violet-600" />}
              bg="bg-violet-50"
              label="Linked Equipment"
              value={counts.equipment_by_linkage.linked}
              sub={`of ${counts.total_equipment} total`}
            />
          )}
        </div>

        {/* Donut Charts Row — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Equipment Ownership Donut */}
          <DonutCard
            title="Equipment Ownership"
            icon={<MdPrecisionManufacturing className="w-3.5 h-3.5" />}
            data={equipmentDonutData}
            colors={DONUT_COLORS.equipment}
            centerLabel="Total"
            centerValue={counts.total_equipment}
            legendItems={[
              {
                label: "Vendor Owned",
                value: counts.equipment_by_owner?.vendor_owned ?? 0,
                color: DONUT_COLORS.equipment[0],
              },
              {
                label: "Facility Owned",
                value: counts.equipment_by_owner?.facility_owned ?? 0,
                color: DONUT_COLORS.equipment[1],
              },
            ]}
          />

          {/* Equipment Linkage Donut */}
          {counts.equipment_by_linkage && (
            <DonutCard
              title="Equipment Linkage"
              icon={<MdLink className="w-3.5 h-3.5" />}
              data={equipmentLinkageData}
              colors={DONUT_COLORS.linkage}
              centerLabel="Linked"
              centerValue={counts.equipment_by_linkage.linked}
              legendItems={[
                {
                  label: "Linked",
                  value: counts.equipment_by_linkage.linked,
                  color: DONUT_COLORS.linkage[0],
                },
                {
                  label: "Not Linked",
                  value: counts.equipment_by_linkage.not_linked,
                  color: DONUT_COLORS.linkage[1],
                },
              ]}
            />
          )}

          {/* SHA Claims Donut */}
          {shaClaims && (
            <DonutCard
              title="SHA Claims"
              icon={<MdMoney className="w-3.5 h-3.5" />}
              data={shaDonutData}
              colors={DONUT_COLORS.sha}
              centerLabel="Total"
              centerValue={shaClaims.total_claims}
              legendItems={[
                {
                  label: "Paid",
                  value: `${shaClaims.paid.count} · ${formatCurrency(shaClaims.paid.amount)}`,
                  color: DONUT_COLORS.sha[0],
                },
                {
                  label: "Rejected",
                  value: shaClaims.rejected.count,
                  color: DONUT_COLORS.sha[1],
                },
                {
                  label: "Pending",
                  value: shaClaims.pending.count,
                  color: DONUT_COLORS.sha[2],
                },
              ]}
            />
          )}

          {/* Efficiency Donut */}
          {efficiency && (
            <DonutCard
              title={`Efficiency (${efficiency.period_days}d)`}
              icon={<MdTrendingUp className="w-3.5 h-3.5" />}
              data={efficiencyDonutData}
              colors={DONUT_COLORS.efficiency}
              centerLabel="Rate"
              centerValue={`${efficiency.completion_rate}%`}
              legendItems={[
                {
                  label: "Completed",
                  value: efficiency.total_completed,
                  color: DONUT_COLORS.efficiency[0],
                },
                {
                  label: "Cancelled",
                  value: efficiency.total_cancelled,
                  color: DONUT_COLORS.efficiency[1],
                },
                ...(efficiency.total_scheduled -
                  efficiency.total_completed -
                  efficiency.total_cancelled >
                0
                  ? [
                      {
                        label: "Remaining",
                        value:
                          efficiency.total_scheduled -
                          efficiency.total_completed -
                          efficiency.total_cancelled,
                        color: DONUT_COLORS.efficiency[2],
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </div>

        {/* Modality Column Chart — Full width */}
        {modalityBarData.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <MdRadio className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Equipment by Modality
              </p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={modalityBarData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Equipment"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                >
                  {modalityBarData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={MODALITY_BAR_COLORS[idx % MODALITY_BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Connectivity — live sits inside linked, so one card reports all
            three rather than a donut that implies a partition. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ConnectivityCard
            connectivity={counts.equipment_connectivity}
            equipmentHref="/equipments"
            className="lg:col-span-2"
          />

          {unmatchedStudyCount(counts.unmatched_studies) > 0 && (
            <button
              onClick={() => router.push("/studies/unmatched")}
              className="bg-white rounded-lg border border-amber-200 p-4 text-left hover:bg-amber-50 transition-colors"
            >
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Non-SHA Studies
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {unmatchedStudyCount(counts.unmatched_studies).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Studies that arrived with no VEMS order behind them
              </p>
            </button>
          )}
        </div>

        <BookingTrendChart
          trend={bookingTrend}
          granularity={filters.trend ?? "daily"}
          onGranularityChange={(value) => setFilter("trend", value)}
          options={dashboardData.trend_options}
          subject="bookings"
        />
      </div>
    </div>
  );
}
