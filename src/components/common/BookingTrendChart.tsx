"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MdTrendingUp } from "react-icons/md";
import type {
  BookingTrend,
  DashboardFilterOption,
  TrendGranularity,
} from "@/services/apiDashboard";

interface BookingTrendChartProps {
  trend?: BookingTrend | null;
  granularity: TrendGranularity;
  onGranularityChange: (granularity: TrendGranularity) => void;
  /** The API's own list; the two defaults are used when it sends none. */
  options?: DashboardFilterOption[];
  /** What the series counts, e.g. "bookings at this facility". */
  subject?: string;
  className?: string;
}

const DEFAULT_OPTIONS: DashboardFilterOption[] = [
  { value: "daily", label: "Daily (30 days)" },
  { value: "monthly", label: "Monthly (12 months)" },
];

/**
 * Booking volume over time.
 *
 * The admin, facility and vendor dashboards all report this in the same shape
 * — they differ only in what the series counts — so one component serves all
 * three. Empty buckets come back as `count: 0` and every bucket is present, so
 * the chart plots `points` as-is without filling gaps.
 */
export const BookingTrendChart: React.FC<BookingTrendChartProps> = ({
  trend,
  granularity,
  onGranularityChange,
  options,
  subject = "bookings",
  className = "",
}) => {
  const points = trend?.points ?? [];
  const choices = options?.length ? options : DEFAULT_OPTIONS;

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        <MdTrendingUp className="w-4 h-4 text-slate-400" />
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Booking Trend
        </p>
        {trend && (
          <span className="text-xs text-slate-400">
            {trend.total.toLocaleString()} {subject} over the last{" "}
            {trend.buckets}{" "}
            {trend.granularity === "monthly" ? "months" : "days"}
          </span>
        )}
        <div className="ml-auto flex rounded-lg border border-slate-200 overflow-hidden">
          {choices.map((option) => {
            const active = granularity === option.value;
            return (
              <button
                key={option.value}
                onClick={() =>
                  onGranularityChange(option.value as TrendGranularity)
                }
                className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {/* The API labels these "Daily (30 days)"; the toggle only has
                    room for the word itself. */}
                {option.value}
              </button>
            );
          })}
        </div>
      </div>

      {points.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">
          No bookings in this period
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={points}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value: number) => [value, "Bookings"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
