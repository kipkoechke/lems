"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  FaArrowUp,
  FaChartLine,
  FaDollarSign,
  FaDownload,
  FaHandshake,
  FaHospital,
  FaMoneyBillWave,
  FaUsers,
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
import { useLotServices } from "../lots/useLotServices";
import { useFacilities } from "../facilities/useFacilities";
import { useVendors } from "../vendors/useVendors";
import { useBookingTrends } from "./useBookingTrends";

const BookingTrends: React.FC = () => {
  // State for showing/hiding additional filters
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Filter states - initially with approval_status=approved to load approved data
  const [filters, setFilters] = useState<Record<string, string>>({
    approval_status: "approved", // Default to approved bookings
  });
  const [tempFilters, setTempFilters] = useState({
    payment_mode: "",
    vendor_code: "",
    lot_number: "",
    service_code: "",
    facility_code: "",
    county_code: "",
    sub_county_code: "",
    start_date: "",
    end_date: "",
    approval_status: "approved", // Default to approved
  });

  // Dropdown states
  const [isCountyDropdownOpen, setIsCountyDropdownOpen] = useState(false);
  const [isSubCountyDropdownOpen, setIsSubCountyDropdownOpen] = useState(false);
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isLotDropdownOpen, setIsLotDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isPaymentModeDropdownOpen, setIsPaymentModeDropdownOpen] =
    useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // State to store selected facility details for display
  const [selectedFacilityDetails, setSelectedFacilityDetails] = useState<{
    code: string;
    name: string;
  } | null>(null);

  // Search states
  const [countySearch, setCountySearch] = useState("");
  const [subCountySearch, setSubCountySearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [lotSearch, setLotSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");
  const [facilitySearchQuery, setFacilitySearchQuery] = useState(""); // For API requests

  // Refs for dropdowns
  const countyDropdownRef = useRef<HTMLDivElement>(null);
  const subCountyDropdownRef = useRef<HTMLDivElement>(null);
  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const lotDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);
  const paymentModeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Load data - initially without filters to get all data
  const { trends, isLoading, error } = useBookingTrends(filters);

  // Data for filter dropdowns
  const { vendors } = useVendors();
  const { lots } = useLots();
  const { facilities } = useFacilities({
    search: facilitySearchQuery || undefined,
  });
  const { counties } = useCounties();
  const { subCounties } = useSubCounties(tempFilters.county_code);

  // Get services for the selected lot
  const { data: lotServices = [] } = useLotServices(tempFilters.lot_number);

  // Filter data based on search
  const filteredCounties = counties?.filter((county) =>
    county.name.toLowerCase().includes(countySearch.toLowerCase())
  );

  const filteredSubCounties = subCounties?.filter((subCounty) =>
    subCounty.name.toLowerCase().includes(subCountySearch.toLowerCase())
  );

  const filteredVendors = vendors?.filter((vendor) =>
    vendor.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const filteredLots = lots?.filter((lot) =>
    `${lot.number} - ${lot.name}`
      .toLowerCase()
      .includes(lotSearch.toLowerCase())
  );

  const filteredServices = lotServices?.filter((service) =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Use facilities from API search instead of client-side filtering
  const filteredFacilities = facilities?.slice(0, 50);

  // Handle facility search with API request
  const handleFacilitySearch = () => {
    if (facilitySearch.trim()) {
      setFacilitySearchQuery(facilitySearch.trim());
    } else {
      // If search is empty, clear search query to show initial facilities
      setFacilitySearchQuery("");
    }
  };

  const clearFacilitySearch = () => {
    setFacilitySearch("");
    setFacilitySearchQuery("");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = [
        { ref: countyDropdownRef, setter: setIsCountyDropdownOpen },
        { ref: subCountyDropdownRef, setter: setIsSubCountyDropdownOpen },
        { ref: vendorDropdownRef, setter: setIsVendorDropdownOpen },
        { ref: lotDropdownRef, setter: setIsLotDropdownOpen },
        { ref: serviceDropdownRef, setter: setIsServiceDropdownOpen },
        { ref: facilityDropdownRef, setter: setIsFacilityDropdownOpen },
        { ref: paymentModeDropdownRef, setter: setIsPaymentModeDropdownOpen },
        { ref: statusDropdownRef, setter: setIsStatusDropdownOpen },
      ];

      dropdowns.forEach(({ ref, setter }) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setter(false);
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setIsCountyDropdownOpen(false);
    setIsSubCountyDropdownOpen(false);
    setIsVendorDropdownOpen(false);
    setIsLotDropdownOpen(false);
    setIsServiceDropdownOpen(false);
    setIsFacilityDropdownOpen(false);
    setIsPaymentModeDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    // Special handling for changes that should reset dependent filters
    const newTempFilters = {
      ...tempFilters,
      [key]: value,
      ...(key === "county_code" ? { sub_county_code: "" } : {}),
      ...(key === "lot_number" ? { service_code: "" } : {}),
    };
    setTempFilters(newTempFilters);

    // Clear search states when filter changes
    if (key === "county_code") {
      setSubCountySearch("");
    }
    if (key === "lot_number") {
      setServiceSearch("");
    }

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
    const clearedFilters = {
      payment_mode: "",
      vendor_code: "",
      lot_number: "",
      service_code: "",
      facility_code: "",
      county_code: "",
      sub_county_code: "",
      start_date: "",
      end_date: "",
      approval_status: "approved", // Keep default approval status
    };
    setTempFilters(clearedFilters);
    setFilters({ approval_status: "approved" });

    // Clear all search states
    setCountySearch("");
    setSubCountySearch("");
    setVendorSearch("");
    setLotSearch("");
    setServiceSearch("");
    setFacilitySearch("");
    setFacilitySearchQuery("");
    setSelectedFacilityDetails(null);

    // Close all dropdowns
    closeAllDropdowns();
  };

  // CSV Export function
  const exportToCSV = () => {
    if (!trends.length) return;

    const headers = [
      "Date",
      "Vendor",
      "Facility",
      "Lot",
      "Service",
      "County",
      "Payment Mode",
      "Total Bookings",
      "Total Amount",
      "Vendor Share",
      "Facility Share",
      "Status",
    ];

    const csvData = trends.map((item) => [
      item.date,
      "N/A", // vendor_name not available
      "N/A", // facility_name not available
      "N/A", // lot_number not available
      "N/A", // service_name not available
      "N/A", // county_name not available
      item.payment_mode,
      item.total,
      item.total_amount,
      item.total_vendor_share,
      item.total_facility_share,
      "N/A", // approval_status not available
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `booking-trends-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Removed title and description */}
        <div className="bg-white rounded-2xl shadow-sm overflow-visible">
          {/* Compact Filters Bar */}
          <div className="p-2 bg-white rounded-2xl border-b border-gray-200">
            <div className="flex flex-col gap-2">
              {/* Primary Filters Row */}
              <div className="flex flex-col gap-2">
                {/* Essential Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {/* County Filter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      County
                    </label>
                    <div className="relative" ref={countyDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCountyDropdownOpen(!isCountyDropdownOpen);
                          closeAllDropdowns();
                          setIsCountyDropdownOpen(!isCountyDropdownOpen);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            tempFilters.county_code
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {counties?.find(
                            (c) => c.code === tempFilters.county_code
                          )?.name || "All Counties"}
                        </span>
                        <FaChevronDown
                          className={`text-gray-400 transition-transform w-3 h-3 ${
                            isCountyDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isCountyDropdownOpen && (
                        <div className="absolute z-[9999] w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <input
                                type="text"
                                placeholder="Search counties..."
                                value={countySearch}
                                onChange={(e) =>
                                  setCountySearch(e.target.value)
                                }
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleFilterChange("county_code", "");
                                setIsCountyDropdownOpen(false);
                                setCountySearch("");
                              }}
                            >
                              <div className="font-semibold text-gray-900 text-sm">
                                All Counties
                              </div>
                            </div>
                            {filteredCounties && filteredCounties.length > 0 ? (
                              filteredCounties.map((county) => (
                                <div
                                  key={county.id}
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "county_code",
                                      county.code
                                    );
                                    setIsCountyDropdownOpen(false);
                                    setCountySearch("");
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {county.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Code: {county.code}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No counties found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vendor Filter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Vendor
                    </label>
                    <div className="relative" ref={vendorDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsVendorDropdownOpen(!isVendorDropdownOpen);
                          closeAllDropdowns();
                          setIsVendorDropdownOpen(!isVendorDropdownOpen);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            tempFilters.vendor_code
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {vendors?.find(
                            (v) => v.code === tempFilters.vendor_code
                          )?.name || "All Vendors"}
                        </span>
                        <FaChevronDown
                          className={`text-gray-400 transition-transform w-3 h-3 ${
                            isVendorDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isVendorDropdownOpen && (
                        <div className="absolute z-[9999] w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <input
                                type="text"
                                placeholder="Search vendors..."
                                value={vendorSearch}
                                onChange={(e) =>
                                  setVendorSearch(e.target.value)
                                }
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleFilterChange("vendor_code", "");
                                setIsVendorDropdownOpen(false);
                                setVendorSearch("");
                              }}
                            >
                              <div className="font-semibold text-gray-900 text-sm">
                                All Vendors
                              </div>
                            </div>
                            {filteredVendors && filteredVendors.length > 0 ? (
                              filteredVendors.map((vendor) => (
                                <div
                                  key={vendor.id}
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "vendor_code",
                                      vendor.code
                                    );
                                    setIsVendorDropdownOpen(false);
                                    setVendorSearch("");
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {vendor.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Code: {vendor.code}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No vendors found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lot Filter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Lot
                    </label>
                    <div className="relative" ref={lotDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLotDropdownOpen(!isLotDropdownOpen);
                          closeAllDropdowns();
                          setIsLotDropdownOpen(!isLotDropdownOpen);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            tempFilters.lot_number
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {lots?.find(
                            (l) => l.number === tempFilters.lot_number
                          )
                            ? `${
                                lots.find(
                                  (l) => l.number === tempFilters.lot_number
                                )?.number
                              } - ${
                                lots.find(
                                  (l) => l.number === tempFilters.lot_number
                                )?.name
                              }`
                            : "All Lots"}
                        </span>
                        <FaChevronDown
                          className={`text-gray-400 transition-transform w-3 h-3 ${
                            isLotDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isLotDropdownOpen && (
                        <div className="absolute z-[9999] w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <input
                                type="text"
                                placeholder="Search lots..."
                                value={lotSearch}
                                onChange={(e) => setLotSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleFilterChange("lot_number", "");
                                setIsLotDropdownOpen(false);
                                setLotSearch("");
                              }}
                            >
                              <div className="font-semibold text-gray-900 text-sm">
                                All Lots
                              </div>
                            </div>
                            {filteredLots && filteredLots.length > 0 ? (
                              filteredLots.map((lot) => (
                                <div
                                  key={lot.id}
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "lot_number",
                                      lot.number
                                    );
                                    setIsLotDropdownOpen(false);
                                    setLotSearch("");
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {lot.number} - {lot.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Number: {lot.number}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No lots found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Filter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Service
                    </label>
                    <div className="relative" ref={serviceDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          if (tempFilters.lot_number) {
                            setIsServiceDropdownOpen(!isServiceDropdownOpen);
                            closeAllDropdowns();
                            setIsServiceDropdownOpen(!isServiceDropdownOpen);
                          }
                        }}
                        disabled={!tempFilters.lot_number}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                      >
                        <span
                          className={
                            tempFilters.service_code
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {!tempFilters.lot_number
                            ? "Select lot first"
                            : lotServices?.find(
                                (s) => s.code === tempFilters.service_code
                              )?.name || "All Services"}
                        </span>
                        <FaChevronDown
                          className={`text-gray-400 transition-transform w-3 h-3 ${
                            isServiceDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isServiceDropdownOpen && tempFilters.lot_number && (
                        <div className="absolute z-[9999] w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <input
                                type="text"
                                placeholder="Search services..."
                                value={serviceSearch}
                                onChange={(e) =>
                                  setServiceSearch(e.target.value)
                                }
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleFilterChange("service_code", "");
                                setIsServiceDropdownOpen(false);
                                setServiceSearch("");
                              }}
                            >
                              <div className="font-semibold text-gray-900 text-sm">
                                All Services
                              </div>
                            </div>
                            {filteredServices && filteredServices.length > 0 ? (
                              filteredServices.map((service) => (
                                <div
                                  key={service.id}
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "service_code",
                                      service.code
                                    );
                                    setIsServiceDropdownOpen(false);
                                    setServiceSearch("");
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {service.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Code: {service.code}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No services found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Facility Filter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Facility
                    </label>
                    <div className="relative" ref={facilityDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
                          closeAllDropdowns();
                          setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                      >
                        <span
                          className={`truncate mr-2 ${
                            tempFilters.facility_code
                              ? "text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {tempFilters.facility_code && selectedFacilityDetails
                            ? `${selectedFacilityDetails.name} (${selectedFacilityDetails.code})`
                            : tempFilters.facility_code &&
                              facilities?.find(
                                (f) => f.code === tempFilters.facility_code
                              )
                            ? `${
                                facilities.find(
                                  (f) => f.code === tempFilters.facility_code
                                )?.name
                              } (${tempFilters.facility_code})`
                            : "All Facilities"}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {tempFilters.facility_code && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFilterChange("facility_code", "");
                                setSelectedFacilityDetails(null);
                                clearFacilitySearch();
                              }}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                              title="Clear facility filter"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                          <FaChevronDown
                            className={`text-gray-400 transition-transform w-3 h-3 ${
                              isFacilityDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {isFacilityDropdownOpen && (
                        <div className="absolute z-[9999] w-96 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                              <input
                                type="text"
                                placeholder="Search facilities..."
                                value={facilitySearch}
                                onChange={(e) =>
                                  setFacilitySearch(e.target.value)
                                }
                                className="w-full pl-9 pr-20 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleFacilitySearch();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleFacilitySearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                              >
                                Search
                              </button>
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            <div
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleFilterChange("facility_code", "");
                                setSelectedFacilityDetails(null);
                                setIsFacilityDropdownOpen(false);
                                clearFacilitySearch();
                              }}
                            >
                              <div className="font-semibold text-gray-900 text-sm">
                                All Facilities
                              </div>
                            </div>
                            {filteredFacilities &&
                            filteredFacilities.length > 0 ? (
                              filteredFacilities.map((facility) => (
                                <div
                                  key={facility.id}
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "facility_code",
                                      facility.code
                                    );
                                    setSelectedFacilityDetails({
                                      code: facility.code,
                                      name: facility.name,
                                    });
                                    setIsFacilityDropdownOpen(false);
                                    clearFacilitySearch();
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    {facility.name} ({facility.code})
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Code: {facility.code}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No facilities found
                                {facilitySearchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      clearFacilitySearch();
                                    }}
                                    className="mt-2 text-blue-600 hover:text-blue-800 text-xs underline block mx-auto"
                                  >
                                    Clear search
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* More Button */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600 opacity-0">
                      Actions
                    </label>
                    <button
                      onClick={() => setShowMoreFilters(!showMoreFilters)}
                      className="w-full px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      More
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${
                          showMoreFilters ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Clear Button */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600 opacity-0">
                      Clear
                    </label>
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Additional Filters (Collapsible) */}
                {showMoreFilters && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                      {/* Sub County Filter */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Sub County
                        </label>
                        <div className="relative" ref={subCountyDropdownRef}>
                          <button
                            type="button"
                            onClick={() => {
                              if (tempFilters.county_code) {
                                setIsSubCountyDropdownOpen(
                                  !isSubCountyDropdownOpen
                                );
                                closeAllDropdowns();
                                setIsSubCountyDropdownOpen(
                                  !isSubCountyDropdownOpen
                                );
                              }
                            }}
                            disabled={!tempFilters.county_code}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                          >
                            <span
                              className={
                                tempFilters.sub_county_code
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {!tempFilters.county_code
                                ? "Select county first"
                                : subCounties?.find(
                                    (s) =>
                                      s.code === tempFilters.sub_county_code
                                  )?.name || "All Sub Counties"}
                            </span>
                            <FaChevronDown
                              className={`text-gray-400 transition-transform w-3 h-3 ${
                                isSubCountyDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isSubCountyDropdownOpen &&
                            tempFilters.county_code && (
                              <div className="absolute z-[9999] w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                                <div className="p-3 border-b border-gray-100">
                                  <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                    <input
                                      type="text"
                                      placeholder="Search sub counties..."
                                      value={subCountySearch}
                                      onChange={(e) =>
                                        setSubCountySearch(e.target.value)
                                      }
                                      className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                  <div
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      handleFilterChange("sub_county_code", "");
                                      setIsSubCountyDropdownOpen(false);
                                      setSubCountySearch("");
                                    }}
                                  >
                                    <div className="font-semibold text-gray-900 text-sm">
                                      All Sub Counties
                                    </div>
                                  </div>
                                  {filteredSubCounties &&
                                  filteredSubCounties.length > 0 ? (
                                    filteredSubCounties.map((subCounty) => (
                                      <div
                                        key={subCounty.id}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                        onClick={() => {
                                          handleFilterChange(
                                            "sub_county_code",
                                            subCounty.code
                                          );
                                          setIsSubCountyDropdownOpen(false);
                                          setSubCountySearch("");
                                        }}
                                      >
                                        <div className="font-semibold text-gray-900 text-sm">
                                          {subCounty.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Code: {subCounty.code}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                      No sub counties found
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Payment Mode Filter */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Payment Mode
                        </label>
                        <div className="relative" ref={paymentModeDropdownRef}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPaymentModeDropdownOpen(
                                !isPaymentModeDropdownOpen
                              );
                              closeAllDropdowns();
                              setIsPaymentModeDropdownOpen(
                                !isPaymentModeDropdownOpen
                              );
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                          >
                            <span
                              className={
                                tempFilters.payment_mode
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {tempFilters.payment_mode === "cash"
                                ? "Cash"
                                : tempFilters.payment_mode === "sha"
                                ? "SHA"
                                : "All Payment Modes"}
                            </span>
                            <FaChevronDown
                              className={`text-gray-400 transition-transform w-3 h-3 ${
                                isPaymentModeDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isPaymentModeDropdownOpen && (
                            <div className="absolute z-[9999] w-64 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-hidden">
                              <div className="max-h-60 overflow-y-auto">
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange("payment_mode", "");
                                    setIsPaymentModeDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    All Payment Modes
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange("payment_mode", "cash");
                                    setIsPaymentModeDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    Cash
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange("payment_mode", "sha");
                                    setIsPaymentModeDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    SHA
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Status Filter */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Status
                        </label>
                        <div className="relative" ref={statusDropdownRef}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsStatusDropdownOpen(!isStatusDropdownOpen);
                              closeAllDropdowns();
                              setIsStatusDropdownOpen(!isStatusDropdownOpen);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                          >
                            <span
                              className={
                                tempFilters.approval_status
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {tempFilters.approval_status === "pending"
                                ? "Pending"
                                : tempFilters.approval_status === "approved"
                                ? "Approved"
                                : tempFilters.approval_status === "rejected"
                                ? "Rejected"
                                : "All Statuses"}
                            </span>
                            <FaChevronDown
                              className={`text-gray-400 transition-transform w-3 h-3 ${
                                isStatusDropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isStatusDropdownOpen && (
                            <div className="absolute z-[9999] w-64 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-hidden">
                              <div className="max-h-60 overflow-y-auto">
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange("approval_status", "");
                                    setIsStatusDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    All Statuses
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "approval_status",
                                      "pending"
                                    );
                                    setIsStatusDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    Pending
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "approval_status",
                                      "approved"
                                    );
                                    setIsStatusDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    Approved
                                  </div>
                                </div>
                                <div
                                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    handleFilterChange(
                                      "approval_status",
                                      "rejected"
                                    );
                                    setIsStatusDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-semibold text-gray-900 text-sm">
                                    Rejected
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date Inputs */}
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={tempFilters.start_date}
                          onChange={(e) =>
                            handleFilterChange("start_date", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-600">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={tempFilters.end_date}
                          onChange={(e) =>
                            handleFilterChange("end_date", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Reduced size with 4 cards in more compact layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {summary.totalBookings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Bookings</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  KES {summary.totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaHandshake className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  KES {summary.totalVendorShare.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Vendor Share</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaHospital className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  KES {summary.totalFacilityShare.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Facility Share</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Over Time */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <FaChartLine className="w-4 h-4 text-blue-600" />
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
              <FaDollarSign className="w-5 h-5 text-purple-600" />
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
                  fill="#0000FF"
                  name="SHA Facility Share"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Export Data
              </h3>
              <p className="text-sm text-gray-600">
                Download the current trends data for further analysis
              </p>
            </div>
            <button
              onClick={exportToCSV}
              disabled={!trends.length}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTrends;
