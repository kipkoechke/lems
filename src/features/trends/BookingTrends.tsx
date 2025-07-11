"use client";

import React, { useMemo, useState } from "react";
import {
  FaArrowUp,
  FaBuilding,
  FaChartLine,
  FaDownload,
  FaFileExport,
  FaFileInvoiceDollar,
  FaFilter,
  FaMoneyBillWave,
  FaUsers,
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
import { useCounties, useSubCounties } from "../counties/useCounties";
import { useLots } from "../lots/useLots";
import { useVendors } from "../vendors/useVendors";
import { useBookingTrends } from "./useBookingTrends";

const BookingTrends: React.FC = () => {
  // Filter states - initially with approval_status=approved to load approved data
  const [filters, setFilters] = useState<Record<string, string>>({
    approval_status: "approved", // Default to approved bookings
  });
  const [tempFilters, setTempFilters] = useState({
    payment_mode: "",
    vendor_code: "",
    lot_number: "",
    county_code: "",
    sub_county_code: "",
    start_date: "",
    end_date: "",
    approval_status: "approved", // Default to approved
  });

  // Load data - initially without filters to get all data
  const { trends, isLoading, error } = useBookingTrends(filters);

  // Data for filter dropdowns
  const { vendors } = useVendors();
  const { lots } = useLots();
  const { counties } = useCounties();
  const { subCounties } = useSubCounties(tempFilters.county_code);

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    // Special handling for county change - reset sub_county when county changes
    const newTempFilters = {
      ...tempFilters,
      [key]: value,
      ...(key === "county_code" ? { sub_county_code: "" } : {}),
    };
    setTempFilters(newTempFilters);

    // Apply filter immediately - only include non-empty values
    const activeFilters: Record<string, string> = {};
    Object.entries(newTempFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue.trim() !== "") {
        activeFilters[filterKey] = filterValue;
      }
    });

    setFilters(activeFilters);
  };

  const clearFilters = () => {
    setTempFilters({
      payment_mode: "",
      vendor_code: "",
      lot_number: "",
      county_code: "",
      sub_county_code: "",
      start_date: "",
      end_date: "",
      approval_status: "approved", // Maintain approved status as default
    });
    setFilters({ approval_status: "approved" }); // Keep approval_status=approved even when clearing other filters
  };

  const applyFilters = () => {
    // Convert temp filters to active filters, excluding empty values
    const activeFilters: Record<string, string> = {};
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        activeFilters[key] = value;
      }
    });
    setFilters(activeFilters);
  };

  // Export functions
  const exportToCSV = () => {
    if (!trends.length) return;

    const csvData = trends.map((item) => ({
      Date: item.date,
      "Payment Mode": item.payment_mode,
      "Total Bookings": item.total,
      "Total Amount (KES)": item.total_amount,
      "Vendor Share (KES)": item.total_vendor_share,
      "Facility Share (KES)": item.total_facility_share,
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-trends-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!trends.length) return;

    const jsonContent = JSON.stringify(trends, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booking-trends-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Process data for different chart types
  const chartData = useMemo(() => {
    if (!trends.length) return [];

    const groupedByDate = trends.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          cash_total: 0,
          cash_amount: 0,
          cash_vendor_share: 0,
          cash_facility_share: 0,
          sha_total: 0,
          sha_amount: 0,
          sha_vendor_share: 0,
          sha_facility_share: 0,
          total_bookings: 0,
          total_amount: 0,
        };
      }

      const total = parseInt(item.total);
      const amount = parseInt(item.total_amount);
      const vendorShare = parseInt(item.total_vendor_share);
      const facilityShare = parseInt(item.total_facility_share);

      if (item.payment_mode === "cash") {
        acc[date].cash_total += total;
        acc[date].cash_amount += amount;
        acc[date].cash_vendor_share += vendorShare;
        acc[date].cash_facility_share += facilityShare;
      } else if (item.payment_mode === "sha") {
        acc[date].sha_total += total;
        acc[date].sha_amount += amount;
        acc[date].sha_vendor_share += vendorShare;
        acc[date].sha_facility_share += facilityShare;
      }

      acc[date].total_bookings += total;
      acc[date].total_amount += amount;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDate).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [trends]);

  // Payment mode distribution data
  const paymentModeData = useMemo(() => {
    const cashData = trends.filter((t) => t.payment_mode === "cash");
    const shaData = trends.filter((t) => t.payment_mode === "sha");

    const cashTotal = cashData.reduce(
      (sum, item) => sum + parseInt(item.total),
      0
    );
    const shaTotal = shaData.reduce(
      (sum, item) => sum + parseInt(item.total),
      0
    );

    return [
      { name: "Cash", value: cashTotal, color: "#10B981" },
      { name: "SHA", value: shaTotal, color: "#3B82F6" },
    ];
  }, [trends]);

  // Summary statistics
  const summary = useMemo(() => {
    const totalBookings = trends.reduce(
      (sum, item) => sum + parseInt(item.total),
      0
    );
    const totalAmount = trends.reduce(
      (sum, item) => sum + parseInt(item.total_amount),
      0
    );
    const totalVendorShare = trends.reduce(
      (sum, item) => sum + parseInt(item.total_vendor_share),
      0
    );
    const totalFacilityShare = trends.reduce(
      (sum, item) => sum + parseInt(item.total_facility_share),
      0
    );

    return {
      totalBookings,
      totalAmount,
      totalVendorShare,
      totalFacilityShare,
    };
  }, [trends]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
              <div className="h-80 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 text-xl mb-4">
              Error loading booking trends
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaChartLine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Booking Trends Analytics
                  </h1>
                  <p className="text-blue-100">
                    Monitor booking patterns and revenue trends over time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaFilter className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filter Analytics Data</h3>
                  <p className="text-sm text-gray-600">Customize your data view with advanced filters</p>
                </div>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                    {Object.keys(filters).length} filter
                    {Object.keys(filters).length !== 1 ? "s" : ""} active
                  </span>
                )}
              </div>
              {Object.keys(filters).length > 0 && (
                <div className="text-right">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Showing filtered results
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Payment Mode Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Payment Mode
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.payment_mode}
                    onChange={(e) =>
                      handleFilterChange("payment_mode", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">All Payment Modes</option>
                    <option value="cash">Cash</option>
                    <option value="sha">SHA</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Approval Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Approval Status
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.approval_status}
                    onChange={(e) =>
                      handleFilterChange("approval_status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Vendor Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Vendor
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.vendor_code}
                    onChange={(e) =>
                      handleFilterChange("vendor_code", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">All Vendors</option>
                    {vendors?.map((vendor) => (
                      <option key={vendor.id} value={vendor.code}>
                        {vendor.name} ({vendor.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Lot Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Lot Number
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.lot_number}
                    onChange={(e) =>
                      handleFilterChange("lot_number", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">All Lots</option>
                    {lots?.map((lot) => (
                      <option key={lot.id} value={lot.number}>
                        {lot.number} - {lot.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Date Range and Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempFilters.start_date}
                  onChange={(e) =>
                    handleFilterChange("start_date", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempFilters.end_date}
                  onChange={(e) =>
                    handleFilterChange("end_date", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  County
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.county_code}
                    onChange={(e) =>
                      handleFilterChange("county_code", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">All Counties</option>
                    {counties?.map((county) => (
                      <option key={county.id} value={county.code}>
                        {county.name} ({county.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Sub County
                </label>
                <div className="relative">
                  <select
                    value={tempFilters.sub_county_code}
                    onChange={(e) =>
                      handleFilterChange("sub_county_code", e.target.value)
                    }
                    disabled={!tempFilters.county_code}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 bg-white shadow-sm transition-all duration-200 appearance-none"
                  >
                    <option value="">
                      {!tempFilters.county_code
                        ? "Select county first"
                        : "All Sub Counties"}
                    </option>
                    {subCounties?.map((subCounty) => (
                      <option key={subCounty.id} value={subCounty.code}>
                        {subCounty.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {Object.keys(filters).length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600 mr-2">Active filters:</span>
                  {Object.entries(filters).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-200"
                    >
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {value}
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Export Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <FaFileExport className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Export Data
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  disabled={!trends.length}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={exportToJSON}
                  disabled={!trends.length}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaFileExport className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {summary.totalBookings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  KES {summary.totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaArrowUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  KES {summary.totalVendorShare.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Vendor Share</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaBuilding className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  KES {summary.totalFacilityShare.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Facility Share</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Over Time */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaChartLine className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Bookings Over Time
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cash_total"
                  stroke="#10B981"
                  strokeWidth={3}
                  name="Cash Bookings"
                  dot={{ fill: "#10B981", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="sha_total"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  name="SHA Bookings"
                  dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Over Time */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaMoneyBillWave className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Revenue Over Time
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `KES ${parseInt(value as string).toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cash_amount"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.7}
                  name="Cash Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="sha_amount"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.7}
                  name="SHA Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Mode Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaFileInvoiceDollar className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Payment Mode Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentModeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Vendor vs Facility Share */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaArrowUp className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Revenue Share Distribution
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [
                    `KES ${parseInt(value as string).toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="cash_vendor_share"
                  stackId="vendor"
                  fill="#8B5CF6"
                  name="Cash Vendor Share"
                />
                <Bar
                  dataKey="sha_vendor_share"
                  stackId="vendor"
                  fill="#6366F1"
                  name="SHA Vendor Share"
                />
                <Bar
                  dataKey="cash_facility_share"
                  stackId="facility"
                  fill="#F59E0B"
                  name="Cash Facility Share"
                />
                <Bar
                  dataKey="sha_facility_share"
                  stackId="facility"
                  fill="#EF4444"
                  name="SHA Facility Share"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTrends;
