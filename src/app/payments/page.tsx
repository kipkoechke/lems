"use client";

import { useCounties } from "@/features/counties/useCounties";
import { useFacilities } from "@/features/facilities/useFacilities";
import { useBookings } from "@/features/services/bookings/useBookings";
import { useCategories } from "@/features/services/categories/useCategories";
import {
  useBookingsTrend,
  usePaymentModeDistribution,
} from "@/features/trends/useBookingsTrend";
import { useVendors } from "@/features/vendors/useVendors";
import { BookingFilters } from "@/services/apiBooking";
import { Building, Check, Users, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
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

interface PaymentSummaryItem {
  facilityName: string;
  facilityId: string;
  serviceCategory: string;
  patientCount: number;
  shaRate: number;
  facilityShare: number;
  vendorShare: number;
  totalShaAmount: number;
  totalFacilityAmount: number;
  totalVendorAmount: number;
  bookingIds: string[];
  paymentMode: string;
}

const PaymentReport: React.FC = () => {
  const [filters, setFilters] = useState<BookingFilters>({});
  const { isLoading, bookings, error } = useBookings({
    ...filters,
    service_completion: "completed",
    approval: "approved",
  });

  const { facilities } = useFacilities();
  const { counties } = useCounties();
  // const { serviceInfos } = useServiceInfos();
  const { categories } = useCategories();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: bookingsTrend = [], isLoading: trendLoading } =
    useBookingsTrend({
      ...filters,
      service_completion: "completed",
      approval: "approved",
    });
  const { data: paymentModeData = [], isLoading: paymentModeLoading } =
    usePaymentModeDistribution({
      ...filters,
      service_completion: "completed",
      approval: "approved",
    });

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"summary" | "approved">("summary");

  const COLORS = [
    "#2563eb",
    "#10b981",
    "#f59e42",
    "#f43f5e",
    "#a21caf",
    "#eab308",
  ];

  // Filter bookings by status for different tabs
  const pendingBookings =
    bookings?.filter((booking) => booking.approval === "pending") || [];
  const approvedBookings =
    bookings?.filter((booking) => booking.approval === "approved") || [];

  // Generate payment summary from pending bookings
  const paymentSummary = useMemo(() => {
    if (!pendingBookings.length) return [];

    const summaryMap = new Map<string, PaymentSummaryItem>();

    pendingBookings.forEach((booking) => {
      const key = `${booking.facility.facilityId}-${booking.service.category.categoryName}`;

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.patientCount += 1;
        existing.bookingIds.push(booking.bookingId);
        // Recalculate totals
        existing.totalShaAmount = existing.shaRate * existing.patientCount;
        existing.totalFacilityAmount =
          existing.facilityShare * existing.patientCount;
        existing.totalVendorAmount =
          existing.vendorShare * existing.patientCount;
      } else {
        const shaRate = parseFloat(booking.service.shaRate || booking.cost);
        const facilityShare = parseFloat(booking.service.facilityShare || "0");
        const vendorShare = parseFloat(booking.service.vendorShare || "0");

        summaryMap.set(key, {
          facilityName: booking.facility.facilityName,
          facilityId: booking.facility.facilityId,
          serviceCategory: booking.service.category.categoryName,
          patientCount: 1,
          shaRate: shaRate,
          facilityShare: facilityShare,
          vendorShare: vendorShare,
          totalShaAmount: shaRate,
          totalFacilityAmount: facilityShare,
          totalVendorAmount: vendorShare,
          bookingIds: [booking.bookingId],
          paymentMode: booking.paymentMode.paymentModeName,
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [pendingBookings]);

  // Generate approved summary from approved bookings
  const approvedSummary = useMemo(() => {
    if (!approvedBookings.length) return [];

    const summaryMap = new Map<string, PaymentSummaryItem>();

    approvedBookings.forEach((booking) => {
      const key = `${booking.facility.facilityId}-${booking.service.category.categoryName}`;

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key)!;
        existing.patientCount += 1;
        existing.bookingIds.push(booking.bookingId);
        // Recalculate totals
        existing.totalShaAmount = existing.shaRate * existing.patientCount;
        existing.totalFacilityAmount =
          existing.facilityShare * existing.patientCount;
        existing.totalVendorAmount =
          existing.vendorShare * existing.patientCount;
      } else {
        const shaRate = parseFloat(booking.service.shaRate || booking.cost);
        const facilityShare = parseFloat(booking.service.facilityShare || "0");
        const vendorShare = parseFloat(booking.service.vendorShare || "0");

        summaryMap.set(key, {
          facilityName: booking.facility.facilityName,
          facilityId: booking.facility.facilityId,
          serviceCategory: booking.service.category.categoryName,
          patientCount: 1,
          shaRate: shaRate,
          facilityShare: facilityShare,
          vendorShare: vendorShare,
          totalShaAmount: shaRate,
          totalFacilityAmount: facilityShare,
          totalVendorAmount: vendorShare,
          bookingIds: [booking.bookingId],
          paymentMode: booking.paymentMode.paymentModeName,
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [approvedBookings]);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const formatRateWithLabel = (
    rate: number,
    patientCount: number,
    label: string
  ) => {
    const formattedRate = formatCurrency(rate);
    const displayRate =
      patientCount > 1 ? `${formattedRate} /patient` : formattedRate;
    return (
      <div className="text-sm">
        <span className="text-gray-700">{label}: </span>
        <span className="font-bold text-gray-900">{displayRate}</span>
      </div>
    );
  };

  const formatTotalWithLabel = (amount: number, label: string) => {
    return (
      <div className="text-sm">
        <span className="text-gray-700">{label}: </span>
        <span className="font-bold text-gray-900">
          {formatCurrency(amount)}
        </span>
      </div>
    );
  };

  // Calculate totals
  const pendingTotals = useMemo(() => {
    return paymentSummary.reduce(
      (acc, item) => ({
        patients: acc.patients + item.patientCount,
        shaAmount: acc.shaAmount + item.totalShaAmount,
        facilityAmount: acc.facilityAmount + item.totalFacilityAmount,
        vendorAmount: acc.vendorAmount + item.totalVendorAmount,
      }),
      { patients: 0, shaAmount: 0, facilityAmount: 0, vendorAmount: 0 }
    );
  }, [paymentSummary]);

  const approvedTotals = useMemo(() => {
    return approvedSummary.reduce(
      (acc, item) => ({
        patients: acc.patients + item.patientCount,
        shaAmount: acc.shaAmount + item.totalShaAmount,
        facilityAmount: acc.facilityAmount + item.totalFacilityAmount,
        vendorAmount: acc.vendorAmount + item.totalVendorAmount,
      }),
      { patients: 0, shaAmount: 0, facilityAmount: 0, vendorAmount: 0 }
    );
  }, [approvedSummary]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <X className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading payment data
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-4">
      <div className="flex flex-wrap gap-4 border-b border-gray-200 mb-6 pb-4 bg-gray-50 rounded-md px-4">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="county">
            County
          </label>
          <select
            id="county"
            value={filters.county_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                county_id: e.target.value || undefined,
              }))
            }
            className="border border-gray-300 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px]"
          >
            <option value="">All Counties</option>
            {counties?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="vendor">
            Vendor
          </label>
          <select
            id="vendor"
            value={filters.vendor_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                vendor_id: e.target.value || undefined,
              }))
            }
            className="border border-gray-300 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px]"
          >
            <option value="">All Vendors</option>
            {vendors?.map((v) => (
              <option key={v.vendorId} value={v.vendorId}>
                {v.vendorName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="service">
            LOT
          </label>
          <select
            id="service"
            value={filters.category_id || ""}
            onChange={(e) =>
              setFilters((s) => ({
                ...s,
                category_id: e.target.value || undefined,
              }))
            }
            className="border border-gray-300 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[120px] max-w-xs truncate"
          >
            <option value="">All LOTs</option>
            {categories?.map((s) => (
              <option
                key={s.categoryId}
                value={s.categoryId}
                title={s.categoryName}
                className="truncate"
              >
                {s.lotNumber} -
                {s.categoryName.length > 20
                  ? s.categoryName.slice(0, 20) + "…"
                  : s.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="facility">
            Facility
          </label>
          <select
            id="facility"
            value={filters.facility_id || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                facility_id: e.target.value || undefined,
              }))
            }
            className="border border-gray-300 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px]"
          >
            <option value="">All Facilities</option>
            {facilities?.map((f) => (
              <option key={f.facilityId} value={f.facilityId}>
                {f.facilityName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="start-date">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={filters.start_date?.slice(0, 10) || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                start_date: e.target.value
                  ? `${e.target.value} 00:00:00`
                  : undefined,
              }))
            }
            className="border border-gray-300 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[140px]"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="end-date">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={filters.end_date?.slice(0, 10) || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                end_date: e.target.value
                  ? `${e.target.value} 23:59:59`
                  : undefined,
              }))
            }
            className="border border-gray-300 rounded px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[140px]"
          />
        </div>
      </div>
      <div className="my-10 mx-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Bookings Trend Bar Chart */}
        <div>
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Bookings Trend
          </h3>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 min-h-[420px] flex flex-col justify-between">
            {trendLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading chart...</p>
              </div>
            ) : bookingsTrend.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={bookingsTrend.sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#1E40AF"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(0, 10)}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    minTickGap={10}
                    axisLine={{ stroke: "#D1D5DB" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={{ stroke: "#D1D5DB" }}
                    label={{
                      value: "Number of Bookings",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "white",
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                    formatter={(value, name) => {
                      if (name === "Bookings") {
                        return [`${value} bookings`, "Number of Bookings"];
                      }
                      return [
                        new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: "KES",
                        }).format(Number(value)),
                        "Total Amount",
                      ];
                    }}
                    labelFormatter={(label) => `Date: ${label.slice(0, 10)}`}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-800 border-none rounded-xl p-4 text-white shadow-2xl">
                            <p className="font-semibold mb-2">{`Date: ${label.slice(
                              0,
                              10
                            )}`}</p>
                            <p className="text-blue-300">{`Bookings: ${data.count}`}</p>
                            <p className="text-green-300">{`Total Amount: ${new Intl.NumberFormat(
                              "en-KE",
                              {
                                style: "currency",
                                currency: "KES",
                              }
                            ).format(Number(data.total_amount))}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Bookings"
                    fill="url(#barGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Mode Donut Chart */}
        <div>
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Payment Mode Distribution
          </h3>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 min-h-[420px] flex items-center justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-30"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-200 to-yellow-200 rounded-full opacity-20 blur-xl"></div>

            <div className="relative z-10 w-full">
              {paymentModeLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-3 text-gray-600 font-medium">
                    Loading chart...
                  </p>
                </div>
              ) : paymentModeData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment mode data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <defs>
                      {paymentModeData.map((entry, idx) => (
                        <linearGradient
                          key={`gradient-${idx}`}
                          id={`gradient-${idx}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={COLORS[idx % COLORS.length]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor={COLORS[idx % COLORS.length]}
                            stopOpacity={0.6}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={paymentModeData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      animationBegin={0}
                      animationDuration={800}
                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                      labelLine={{
                        stroke: "#9CA3AF",
                        strokeWidth: 1,
                        strokeDasharray: "2 2",
                      }}
                      style={{
                        filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                      }}
                    >
                      {paymentModeData.map((entry, idx) => (
                        <Cell
                          key={entry.payment_mode_id}
                          fill={`url(#gradient-${idx})`}
                          stroke="white"
                          strokeWidth={2}
                          style={{
                            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "12px",
                        color: "white",
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                        backdropFilter: "blur(10px)",
                      }}
                      formatter={(value, name, props) => [
                        `${value} payments`,
                        props.payload.name,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* {activeTab === "approved" && ( */}
      <>
        {/* Approved Services Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg mx-4 leading-6 font-medium text-gray-900">
            Services Payment Report
          </h3>
        </div>

        {approvedSummary.length === 0 ? (
          <div className="text-center py-12">
            <Check className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No approved services
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Approved services will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Facility Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                    Service Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Total Patients
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Cost Breakdown
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Totals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Payment Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedSummary.map((item, index) => (
                  <tr
                    key={`approved-${item.facilityId}-${item.serviceCategory}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-normal">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                        <div
                          className="text-sm font-medium text-gray-900 "
                          title={item.facilityName}
                        >
                          {item.facilityName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div
                        className="text-sm text-gray-900 truncate max-w-[100px]"
                        title={item.serviceCategory}
                      >
                        {item.serviceCategory}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-purple-600 mr-1 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.patientCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex justify-between flex-col">
                        {formatRateWithLabel(
                          item.shaRate,
                          item.patientCount,
                          "SHA Rate"
                        )}
                        {formatRateWithLabel(
                          item.vendorShare,
                          item.patientCount,
                          "Vendor Share"
                        )}
                        {formatRateWithLabel(
                          item.facilityShare,
                          item.patientCount,
                          "Facility Share"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {formatTotalWithLabel(item.totalShaAmount, "SHA Total")}
                        {formatTotalWithLabel(
                          item.totalVendorAmount,
                          "Vendor Total"
                        )}
                        {formatTotalWithLabel(
                          item.totalFacilityAmount,
                          "Facility Total"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {item.paymentMode}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                  <td
                    className="px-4 py-4 text-sm font-bold text-gray-900"
                    colSpan={2}
                  >
                    TOTALS
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-purple-600 mr-1 flex-shrink-0" />
                      <span className="text-sm font-bold text-gray-900">
                        {approvedTotals.patients}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-center">
                    -
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {formatTotalWithLabel(
                        approvedTotals.shaAmount,
                        "SHA Total"
                      )}
                      {formatTotalWithLabel(
                        approvedTotals.vendorAmount,
                        "Vendor Total"
                      )}
                      {formatTotalWithLabel(
                        approvedTotals.facilityAmount,
                        "Facility Total"
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">-</td>
                  <td className="px-4 py-4 text-sm text-gray-500">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </>
      {/* )} */}

      {/* Summary Statistics */}
      {/* <div className="mt-8 mx-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Pending Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(pendingTotals.shaAmount)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Patients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingTotals.patients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Check className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Approved Patients
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {approvedTotals.patients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PaymentReport;
