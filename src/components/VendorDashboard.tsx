"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaCog,
  FaHospital,
  FaClipboardList,
  FaBoxes,
  FaStethoscope,
  FaUsers,
  FaChartLine,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrentUser } from "@/hooks/useAuth";
import { useVendorDashboard } from "@/features/vendors/useVendorDashboard";
import { VendorDashboardFilters } from "@/services/apiVendorDashboard";
import StatCard from "@/components/common/StatCard";

// Top filter dropdown component
interface TopFilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  clearable?: boolean;
}

const TopFilterDropdown: React.FC<TopFilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  searchable = false,
  placeholder = "Select...",
  clearable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="flex flex-col min-w-[120px]">
      <label className="text-xs font-medium text-slate-500 mb-1">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-left text-sm flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className={`truncate ${value ? "text-slate-900" : "text-slate-400"}`}>
            {selectedLabel}
          </span>
          <div className="flex items-center gap-1 ml-1">
            {clearable && value && (
              <span
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ×
              </span>
            )}
            <FaChevronDown
              className={`text-slate-400 text-xs transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            <div className="py-1">
              <button
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
              >
                {placeholder}
              </button>
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                    value === opt.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Format currency
const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

// Format number with K/M suffix
const formatNumber = (num: number | string) => {
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

// Colors for charts
const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

// Equipment status colors
const EQUIPMENT_STATUS_COLORS: Record<string, string> = {
  Active: "#10B981",
  Maintenance: "#F59E0B",
  Decommissioned: "#EF4444",
  Pending: "#6B7280",
};

// Booking status colors
const BOOKING_STATUS_COLORS: Record<string, string> = {
  "Not Started": "#F59E0B",
  Completed: "#10B981",
  Cancelled: "#EF4444",
};

export const VendorDashboard: React.FC = () => {
  const user = useCurrentUser();
  // For vendor users, the vendor ID is in the entity field
  const vendorId = user?.entity?.id || "";

  // Filter states
  const [selectedDuration, setSelectedDuration] = useState<string>("last_30_days");
  const [facilityId, setFacilityId] = useState("");
  const [lotId, setLotId] = useState("");
  const [serviceId, setServiceId] = useState("");

  // Duration options
  const durationOptions = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last_7_days", label: "Last 7 Days" },
    { key: "last_30_days", label: "Last 30 Days" },
    { key: "last_3_months", label: "Last 3 Months" },
    { key: "last_6_months", label: "Last 6 Months" },
    { key: "last_year", label: "Last Year" },
  ];

  // Get date range from duration
  const getDateRangeFromDuration = (duration: string) => {
    const end = new Date();
    const start = new Date();

    switch (duration) {
      case "today":
        break;
      case "yesterday":
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
      case "last_7_days":
        start.setDate(start.getDate() - 7);
        break;
      case "last_30_days":
        start.setDate(start.getDate() - 30);
        break;
      case "last_3_months":
        start.setMonth(start.getMonth() - 3);
        break;
      case "last_6_months":
        start.setMonth(start.getMonth() - 6);
        break;
      case "last_year":
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return {
      from: start.toISOString().split("T")[0],
      to: end.toISOString().split("T")[0],
    };
  };

  // Computed filters
  const filters = useMemo<VendorDashboardFilters>(() => {
    const dateRange = getDateRangeFromDuration(selectedDuration);
    const activeFilters: VendorDashboardFilters = {
      from: dateRange.from,
      to: dateRange.to,
    };

    if (facilityId) activeFilters.facility_id = facilityId;
    if (lotId) activeFilters.lot_id = lotId;
    if (serviceId) activeFilters.service_id = serviceId;

    return activeFilters;
  }, [selectedDuration, facilityId, lotId, serviceId]);

  // Fetch dashboard data
  const { data: dashboard, isLoading, error } = useVendorDashboard(vendorId, filters);

  // Handle lot change - reset service
  const handleLotChange = (value: string) => {
    setLotId(value);
    setServiceId("");
  };

  // Chart data from trendline
  const trendChartData = useMemo(() => {
    if (!dashboard?.trendline?.data) return [];
    return dashboard.trendline.data.map((point) => ({
      date: point.period,
      total: parseFloat(point.total),
      vendorShare: parseFloat(point.vendor_share),
      sha: parseFloat(point.sha),
      cash: parseFloat(point.cash),
      otherInsurance: parseFloat(point.other_insurance),
      servicesCount: point.services_count,
    }));
  }, [dashboard]);

  // Payment mode pie chart data
  const paymentModeData = useMemo(() => {
    if (!dashboard?.revenue?.by_payment_type) return [];
    const { sha, cash, other_insurance } = dashboard.revenue.by_payment_type;
    return [
      { name: "SHA", value: parseFloat(sha) || 0 },
      { name: "Cash", value: parseFloat(cash) || 0 },
      { name: "Other Insurance", value: parseFloat(other_insurance) || 0 },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  // Equipment status pie chart data
  const equipmentStatusData = useMemo(() => {
    if (!dashboard?.equipment?.by_status) return [];
    const { active, maintenance, decommissioned, pending } =
      dashboard.equipment.by_status;
    return [
      { name: "Active", value: active, color: EQUIPMENT_STATUS_COLORS.Active },
      { name: "Maintenance", value: maintenance, color: EQUIPMENT_STATUS_COLORS.Maintenance },
      { name: "Decommissioned", value: decommissioned, color: EQUIPMENT_STATUS_COLORS.Decommissioned },
      { name: "Pending", value: pending, color: EQUIPMENT_STATUS_COLORS.Pending },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  // Booking status pie chart data
  const bookingStatusData = useMemo(() => {
    if (!dashboard?.bookings?.by_service_status) return [];
    const { not_started, completed, cancelled } =
      dashboard.bookings.by_service_status;
    return [
      { name: "Not Started", value: not_started, color: BOOKING_STATUS_COLORS["Not Started"] },
      { name: "Completed", value: completed, color: BOOKING_STATUS_COLORS.Completed },
      { name: "Cancelled", value: cancelled, color: BOOKING_STATUS_COLORS.Cancelled },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-slate-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 text-sm">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3">
        <div className="flex flex-wrap items-end gap-3">
          <TopFilterDropdown
            label="Facility"
            value={facilityId}
            onChange={setFacilityId}
            options={
              dashboard?.facilities?.list?.map((f) => ({
                value: f.id,
                label: f.name,
              })) || []
            }
            searchable
            placeholder="All Facilities"
          />
          <TopFilterDropdown
            label="Lot"
            value={lotId}
            onChange={handleLotChange}
            options={
              dashboard?.lots?.list?.map((l) => ({
                value: l.id,
                label: `${l.number} - ${l.name}`,
              })) || []
            }
            searchable
            placeholder="All Lots"
          />
          <TopFilterDropdown
            label="Service"
            value={serviceId}
            onChange={setServiceId}
            options={
              dashboard?.services?.list?.map((s) => ({
                value: s.id,
                label: s.name,
              })) || []
            }
            searchable
            placeholder="All Services"
          />
          <TopFilterDropdown
            label="Period"
            value={selectedDuration}
            onChange={setSelectedDuration}
            options={durationOptions.map((opt) => ({
              value: opt.key,
              label: opt.label,
            }))}
            placeholder="Last 30 Days"
            clearable={false}
          />
        </div>
      </div>

      {/* Stats Cards - Using common StatCard with compact mode */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <StatCard
          title="Total Equipment"
          mainValue={dashboard?.equipment?.total || 0}
          subtitle={`${dashboard?.equipment?.by_status?.active || 0} active`}
          compact
        >
          <FaCog className="w-4 h-4 text-blue-500" />
        </StatCard>
        <StatCard
          title="Facilities"
          mainValue={dashboard?.facilities?.count || 0}
          compact
        >
          <FaHospital className="w-4 h-4 text-emerald-500" />
        </StatCard>
        <StatCard
          title="Patients"
          mainValue={dashboard?.patients?.unique_count || 0}
          compact
        >
          <FaUsers className="w-4 h-4 text-purple-500" />
        </StatCard>
        <StatCard
          title="Lots"
          mainValue={dashboard?.lots?.count || 0}
          subtitle={`${dashboard?.services?.count || 0} services`}
          compact
        >
          <FaBoxes className="w-4 h-4 text-pink-500" />
        </StatCard>
        <StatCard
          title="Bookings"
          mainValue={dashboard?.bookings?.total_bookings || 0}
          subtitle={`${dashboard?.bookings?.total_services || 0} services`}
          compact
        >
          <FaClipboardList className="w-4 h-4 text-cyan-500" />
        </StatCard>
        <StatCard
          title="Gross Revenue"
          mainValue={formatNumber(dashboard?.revenue?.tariff || 0)}
          subtitle={`Share: ${formatNumber(dashboard?.revenue?.vendor_share || 0)}`}
          compact
        >
          <FaChartLine className="w-4 h-4 text-amber-500" />
        </StatCard>
      </div>

      {/* Revenue & Services Charts - First after stat cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trends */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Revenue Trends</h3>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="colorVendor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }
                  formatter={(value: number) => [formatCurrency(value), "Vendor Share"]}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="vendorShare"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorVendor)"
                  name="Vendor Share"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              No trend data available
            </div>
          )}
        </div>

        {/* Services Performed */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Services Performed</h3>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  }
                  formatter={(value: number) => [value, "Services"]}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="servicesCount"
                  fill="#3B82F6"
                  name="Services"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">
              No services data available
            </div>
          )}
        </div>
      </div>

      {/* Status Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Equipment Status Donut */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Equipment Status</h3>
          {equipmentStatusData.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Count"]} />
                  <Legend 
                    iconSize={8} 
                    wrapperStyle={{ fontSize: "11px" }}
                    formatter={(value) => <span className="text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
              No equipment data
            </div>
          )}
        </div>

        {/* Service Status Donut */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Service Status</h3>
          {bookingStatusData.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Count"]} />
                  <Legend 
                    iconSize={8} 
                    wrapperStyle={{ fontSize: "11px" }}
                    formatter={(value) => <span className="text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
              No service data
            </div>
          )}
        </div>

        {/* Payment Type Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Revenue by Payment Type</h3>
          {paymentModeData.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentModeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    iconSize={8} 
                    wrapperStyle={{ fontSize: "11px" }}
                    formatter={(value) => <span className="text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-slate-400 text-sm">
              No payment data
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Booking Source & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Booking Source */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Booking Source</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Standalone</span>
              <span className="text-sm font-semibold text-slate-900">
                {dashboard?.bookings?.by_source?.standalone || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">HMIS</span>
              <span className="text-sm font-semibold text-slate-900">
                {dashboard?.bookings?.by_source?.hmis || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Provider Portal</span>
              <span className="text-sm font-semibold text-slate-900">
                {dashboard?.bookings?.by_source?.provider_portal || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Facilities List */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Facilities ({dashboard?.facilities?.count || 0})
          </h3>
          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {dashboard?.facilities?.list?.slice(0, 5).map((facility, index) => (
              <div
                key={facility.id}
                className="flex items-center gap-2 p-1.5 bg-slate-50 rounded"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-xs truncate">
                    {facility.name}
                  </p>
                </div>
              </div>
            ))}
            {(!dashboard?.facilities?.list ||
              dashboard.facilities.list.length === 0) && (
              <div className="text-center text-slate-400 text-xs py-4">
                No facilities
              </div>
            )}
          </div>
        </div>

        {/* Lots List */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Lots ({dashboard?.lots?.count || 0})
          </h3>
          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {dashboard?.lots?.list?.slice(0, 5).map((lot, index) => (
              <div
                key={lot.id}
                className="flex items-center gap-2 p-1.5 bg-slate-50 rounded"
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                >
                  {lot.number}
                </span>
                <span className="text-xs text-slate-700 truncate">{lot.name}</span>
              </div>
            ))}
            {(!dashboard?.lots?.list || dashboard.lots.list.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">No lots</p>
            )}
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Services ({dashboard?.services?.count || 0})
          </h3>
          <div className="space-y-2 max-h-[140px] overflow-y-auto">
            {dashboard?.services?.list?.slice(0, 5).map((service, index) => (
              <div
                key={service.id}
                className="flex items-center gap-2 p-1.5 bg-slate-50 rounded"
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-white shrink-0"
                  style={{
                    backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length],
                  }}
                >
                  <FaStethoscope className="w-2.5 h-2.5" />
                </span>
                <span className="text-xs text-slate-700 truncate">{service.name}</span>
              </div>
            ))}
            {(!dashboard?.services?.list || dashboard.services.list.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-4">No services</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
