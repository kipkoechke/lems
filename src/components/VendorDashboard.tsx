"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaCog,
  FaHospital,
  FaMoneyBillWave,
  FaClipboardList,
  FaBoxes,
  FaStethoscope,
  FaFileContract,
  FaChartLine,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
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
import { useCurrentFacility } from "@/hooks/useAuth";
import {
  useVendorStats,
  useVendorBookingTrends,
} from "@/features/vendors/useVendorDashboard";
import { useCounties, useSubCounties } from "@/features/counties/useCounties";
import { useLots } from "@/features/lots/useLots";
import { useLotServices } from "@/features/lots/useLotServices";
import { useFacilities } from "@/features/facilities/useFacilities";
import { VendorTrendFilters } from "@/services/apiVendorDashboard";

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

// Top filter dropdown component - matches the reference UI
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
        opt.label.toLowerCase().includes(search.toLowerCase()),
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
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  const facility = useCurrentFacility(); // This contains vendor code for vendors
  const vendorCode = facility?.code || "";

  // Filter states - filters apply automatically when changed
  const [selectedDuration, setSelectedDuration] = useState<string>("all_time");
  const [countyCode, setCountyCode] = useState("");
  const [subCountyCode, setSubCountyCode] = useState("");
  const [facilityCode, setFacilityCode] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [serviceCode, setServiceCode] = useState("");

  // Duration options
  const durationOptions = [
    { key: "all_time", label: "All Time" },
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
      case "all_time":
      default:
        return { start_date: "", end_date: "" };
    }

    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    };
  };

  // Computed filters that auto-apply
  const filters = useMemo(() => {
    const dateRange = getDateRangeFromDuration(selectedDuration);
    const activeFilters: Partial<VendorTrendFilters> = {};

    if (dateRange.start_date) activeFilters.start_date = dateRange.start_date;
    if (dateRange.end_date) activeFilters.end_date = dateRange.end_date;
    if (countyCode) activeFilters.county_code = countyCode;
    if (subCountyCode) activeFilters.sub_county_code = subCountyCode;
    if (facilityCode) activeFilters.facility_code = facilityCode;
    if (lotNumber) activeFilters.lot_number = lotNumber;
    if (serviceCode) activeFilters.service_code = serviceCode;

    return activeFilters;
  }, [
    selectedDuration,
    countyCode,
    subCountyCode,
    facilityCode,
    lotNumber,
    serviceCode,
  ]);

  // Data hooks
  const {
    stats,
    contracts,
    isLoading: statsLoading,
  } = useVendorStats(vendorCode);
  const { data: trendsData, isLoading: trendsLoading } = useVendorBookingTrends(
    vendorCode,
    filters,
  );

  // Filter data hooks
  const { counties } = useCounties();
  const { subCounties } = useSubCounties(countyCode);
  const { lots } = useLots();
  // Find the selected lot by number to get its id for fetching services
  const selectedLot = lots?.find((l) => l.number === lotNumber);
  const { services: lotServices } = useLotServices(selectedLot?.id || "");
  const { facilities } = useFacilities({});

  // Handle county change - reset sub-county
  const handleCountyChange = (value: string) => {
    setCountyCode(value);
    setSubCountyCode("");
  };

  // Handle lot change - reset service
  const handleLotChange = (value: string) => {
    setLotNumber(value);
    setServiceCode("");
  };

  // Compute revenue from trends
  const revenueStats = useMemo(() => {
    if (!trendsData?.trends)
      return { total: 0, vendorShare: 0, facilityShare: 0 };

    return trendsData.trends.reduce(
      (acc: any, trend: any) => ({
        total: acc.total + parseFloat(trend.total_amount || "0"),
        vendorShare:
          acc.vendorShare + parseFloat(trend.total_vendor_share || "0"),
        facilityShare:
          acc.facilityShare + parseFloat(trend.total_facility_share || "0"),
      }),
      { total: 0, vendorShare: 0, facilityShare: 0 },
    );
  }, [trendsData]);

  // Chart data
  const trendChartData = useMemo(() => {
    if (!trendsData?.trends) return [];

    // Group by date
    const grouped = trendsData.trends.reduce((acc: any, trend: any) => {
      const date = trend.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          bookings: 0,
          revenue: 0,
          vendorShare: 0,
        };
      }
      acc[date].bookings += parseInt(trend.total || "0");
      acc[date].revenue += parseFloat(trend.total_amount || "0");
      acc[date].vendorShare += parseFloat(trend.total_vendor_share || "0");
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) =>
      a.date.localeCompare(b.date),
    );
  }, [trendsData]);

  // Revenue by payment mode
  const paymentModeData = useMemo(() => {
    if (!trendsData?.trends) return [];

    const grouped = trendsData.trends.reduce((acc: any, trend: any) => {
      const mode = trend.payment_mode || "Unknown";
      if (!acc[mode]) {
        acc[mode] = { name: mode, value: 0, count: 0 };
      }
      acc[mode].value += parseFloat(trend.total_vendor_share || "0");
      acc[mode].count += parseInt(trend.total || "0");
      return acc;
    }, {});

    return Object.values(grouped);
  }, [trendsData]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar - Always visible */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Location Filters */}
          <TopFilterDropdown
            label="County"
            value={countyCode}
            onChange={handleCountyChange}
            options={
              counties?.map((c) => ({ value: c.code, label: c.name })) || []
            }
            searchable
            placeholder="All Counties"
          />
          <TopFilterDropdown
            label="Sub-County"
            value={subCountyCode}
            onChange={setSubCountyCode}
            options={
              subCounties?.map((sc) => ({
                value: sc.code,
                label: sc.name,
              })) || []
            }
            searchable
            placeholder="All Sub-Counties"
          />
          <TopFilterDropdown
            label="Facility"
            value={facilityCode}
            onChange={setFacilityCode}
            options={
              facilities?.map((f) => ({ value: f.code, label: f.name })) || []
            }
            searchable
            placeholder="All Facilities"
          />

          {/* Lot & Service Filters */}
          <TopFilterDropdown
            label="Lot"
            value={lotNumber}
            onChange={handleLotChange}
            options={
              lots?.map((l) => ({
                value: l.number,
                label: `${l.number} - ${l.name}`,
              })) || []
            }
            searchable
            placeholder="All Lots"
          />
          <TopFilterDropdown
            label="Service"
            value={serviceCode}
            onChange={setServiceCode}
            options={
              lotServices?.map((s) => ({ value: s.code, label: s.name })) || []
            }
            searchable
            placeholder="All Services"
          />

          {/* Period Filter - rightmost with clear button */}
          <TopFilterDropdown
            label="Period"
            value={selectedDuration}
            onChange={setSelectedDuration}
            options={durationOptions.map((opt) => ({
              value: opt.key,
              label: opt.label,
            }))}
            placeholder="All Time"
            clearable
          />
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h2>
        <p className="text-gray-500">Overview of your equipment and services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Equipment"
          value={stats.total_equipments}
          icon={<FaCog className="w-6 h-6" />}
          color="#3B82F6"
        />
        <StatCard
          title="Facilities Served"
          value={stats.total_facilities_served}
          icon={<FaHospital className="w-6 h-6" />}
          color="#10B981"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueStats.vendorShare)}
          icon={<FaMoneyBillWave className="w-6 h-6" />}
          color="#F59E0B"
          subtext="Your share"
        />
        <StatCard
          title="Active Contracts"
          value={stats.active_contracts}
          icon={<FaFileContract className="w-6 h-6" />}
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lots"
          value={stats.total_lots}
          icon={<FaBoxes className="w-6 h-6" />}
          color="#EC4899"
        />
        <StatCard
          title="Total Services"
          value={stats.total_services}
          icon={<FaStethoscope className="w-6 h-6" />}
          color="#06B6D4"
        />
        <StatCard
          title="Total Bookings"
          value={trendChartData.reduce(
            (acc: number, d: any) => acc + d.bookings,
            0,
          )}
          icon={<FaClipboardList className="w-6 h-6" />}
          color="#EF4444"
        />
        <StatCard
          title="Gross Revenue"
          value={formatCurrency(revenueStats.total)}
          icon={<FaChartLine className="w-6 h-6" />}
          color="#84CC16"
          subtext="Total billed"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Equipment Usage Trends
          </h3>
          {trendsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient
                    id="colorBookings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                  formatter={(value: number, name: string) => [
                    name === "revenue" || name === "vendorShare"
                      ? formatCurrency(value)
                      : value,
                    name === "bookings"
                      ? "Bookings"
                      : name === "vendorShare"
                        ? "Vendor Share"
                        : "Revenue",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trends
          </h3>
          {trendsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
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
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Vendor Share",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vendorShare"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981" }}
                  name="Vendor Share"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Payment Mode Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Payment Mode
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
              No payment mode data available
            </div>
          )}
        </div>

        {/* Top Facilities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contracts Overview
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {contracts.slice(0, 10).map((contract, index) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      backgroundColor:
                        CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {contract.facility?.name || "Unknown Facility"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contract.lot?.name || "Unknown Lot"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contract.is_active === "1"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {contract.is_active === "1" ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
            {contracts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No contracts found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
