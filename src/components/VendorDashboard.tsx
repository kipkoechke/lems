"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaCog,
  FaHospital,
  FaMoneyBillWave,
  FaClipboardList,
  FaBoxes,
  FaStethoscope,
  FaUsers,
  FaChartLine,
  FaChevronDown,
  FaSearch,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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

// Stat card component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtext,
}) => (
  <div
    className="bg-white rounded-xl shadow-lg p-6 border-l-4"
    style={{ borderColor: color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
    </div>
  </div>
);

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
    <div className="flex flex-col min-w-[140px]">
      <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-left text-sm flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {selectedLabel}
          </span>
          <div className="flex items-center gap-1">
            {clearable && value && (
              <span
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ×
              </span>
            )}
            <FaChevronDown
              className={`text-gray-400 text-xs transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
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
                      : "text-gray-700"
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

  // Equipment status data
  const equipmentStatusData = useMemo(() => {
    if (!dashboard?.equipment?.by_status) return [];
    const { active, maintenance, decommissioned, pending } =
      dashboard.equipment.by_status;
    return [
      { name: "Active", value: active, color: "#10B981" },
      { name: "Maintenance", value: maintenance, color: "#F59E0B" },
      { name: "Decommissioned", value: decommissioned, color: "#EF4444" },
      { name: "Pending", value: pending, color: "#6B7280" },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  // Booking status data
  const bookingStatusData = useMemo(() => {
    if (!dashboard?.bookings?.by_service_status) return [];
    const { not_started, completed, cancelled } =
      dashboard.bookings.by_service_status;
    return [
      { name: "Not Started", value: not_started, color: "#F59E0B" },
      { name: "Completed", value: completed, color: "#10B981" },
      { name: "Cancelled", value: cancelled, color: "#EF4444" },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Facility Filter */}
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

          {/* Lot Filter */}
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

          {/* Service Filter */}
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

          {/* Period Filter */}
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {dashboard?.vendor?.name || "Vendor"} Dashboard
          </h2>
          <p className="text-gray-500">
            {dashboard?.period?.from} to {dashboard?.period?.to}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Vendor Code: <span className="font-mono font-medium">{dashboard?.vendor?.code}</span>
        </div>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Equipment"
          value={dashboard?.equipment?.total || 0}
          icon={<FaCog className="w-6 h-6" />}
          color="#3B82F6"
          subtext={`${dashboard?.equipment?.by_status?.active || 0} active`}
        />
        <StatCard
          title="Facilities Served"
          value={dashboard?.facilities?.count || 0}
          icon={<FaHospital className="w-6 h-6" />}
          color="#10B981"
        />
        <StatCard
          title="Vendor Share"
          value={formatCurrency(dashboard?.revenue?.vendor_share || "0")}
          icon={<FaMoneyBillWave className="w-6 h-6" />}
          color="#F59E0B"
          subtext="Your revenue"
        />
        <StatCard
          title="Unique Patients"
          value={dashboard?.patients?.unique_count || 0}
          icon={<FaUsers className="w-6 h-6" />}
          color="#8B5CF6"
        />
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lots"
          value={dashboard?.lots?.count || 0}
          icon={<FaBoxes className="w-6 h-6" />}
          color="#EC4899"
        />
        <StatCard
          title="Total Services"
          value={dashboard?.services?.count || 0}
          icon={<FaStethoscope className="w-6 h-6" />}
          color="#06B6D4"
        />
        <StatCard
          title="Total Bookings"
          value={dashboard?.bookings?.total_bookings || 0}
          icon={<FaClipboardList className="w-6 h-6" />}
          color="#EF4444"
          subtext={`${dashboard?.bookings?.total_services || 0} services`}
        />
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(dashboard?.revenue?.tariff || "0")}
          icon={<FaChartLine className="w-6 h-6" />}
          color="#84CC16"
          subtext="Total billed"
        />
      </div>

      {/* Equipment & Booking Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Equipment Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Equipment Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <span className="font-semibold">
                {dashboard?.equipment?.by_status?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaWrench className="text-yellow-500" />
                <span className="text-sm text-gray-600">Maintenance</span>
              </div>
              <span className="font-semibold">
                {dashboard?.equipment?.by_status?.maintenance || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTimesCircle className="text-red-500" />
                <span className="text-sm text-gray-600">Decommissioned</span>
              </div>
              <span className="font-semibold">
                {dashboard?.equipment?.by_status?.decommissioned || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaClock className="text-gray-500" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="font-semibold">
                {dashboard?.equipment?.by_status?.pending || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaClock className="text-yellow-500" />
                <span className="text-sm text-gray-600">Not Started</span>
              </div>
              <span className="font-semibold">
                {dashboard?.bookings?.by_service_status?.not_started || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="font-semibold">
                {dashboard?.bookings?.by_service_status?.completed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaTimesCircle className="text-red-500" />
                <span className="text-sm text-gray-600">Cancelled</span>
              </div>
              <span className="font-semibold">
                {dashboard?.bookings?.by_service_status?.cancelled || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Source */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Source
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Standalone</span>
              <span className="font-semibold">
                {dashboard?.bookings?.by_source?.standalone || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">HMIS</span>
              <span className="font-semibold">
                {dashboard?.bookings?.by_source?.hmis || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Provider Portal</span>
              <span className="font-semibold">
                {dashboard?.bookings?.by_source?.provider_portal || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trends
          </h3>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="colorVendor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                  formatter={(value: number) => [formatCurrency(value), "Vendor Share"]}
                />
                <Legend />
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
            <div className="flex items-center justify-center h-64 text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Services Count Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Services Performed
          </h3>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-KE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                  formatter={(value: number) => [value, "Services"]}
                />
                <Legend />
                <Bar
                  dataKey="servicesCount"
                  fill="#3B82F6"
                  name="Services"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No services data available
            </div>
          )}
        </div>
      </div>

      {/* Payment Mode Distribution & Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Mode Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Payment Type
          </h3>
          {paymentModeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {paymentModeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No payment data available
            </div>
          )}
        </div>

        {/* Facilities List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Facilities ({dashboard?.facilities?.count || 0})
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {dashboard?.facilities?.list?.map((facility, index) => (
              <div
                key={facility.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {facility.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {facility.fr_code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!dashboard?.facilities?.list ||
              dashboard.facilities.list.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No facilities found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lots & Services Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lots List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lots ({dashboard?.lots?.count || 0})
          </h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {dashboard?.lots?.list?.map((lot, index) => (
              <div
                key={lot.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                >
                  {lot.number}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{lot.name}</p>
                </div>
              </div>
            ))}
            {(!dashboard?.lots?.list || dashboard.lots.list.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No lots found
              </div>
            )}
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Services ({dashboard?.services?.count || 0})
          </h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {dashboard?.services?.list?.map((service, index) => (
              <div
                key={service.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                >
                  <FaStethoscope className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {service.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{service.code}</p>
                </div>
              </div>
            ))}
            {(!dashboard?.services?.list ||
              dashboard.services.list.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No services found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
