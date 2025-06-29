"use client";

import React, { useMemo, useState } from "react";
import {
  FaArrowUp,
  FaBuilding,
  FaChartLine,
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
import { useBookingTrends } from "./useBookingTrends";

const BookingTrends: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { trends, isLoading, error } = useBookingTrends(dateRange);

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
          <div className="p-6 bg-gray-50 border-b">
            <div className="flex items-center gap-4">
              <FaFilter className="text-gray-500" />
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setDateRange({ startDate: "", endDate: "" })}
                  className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
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
