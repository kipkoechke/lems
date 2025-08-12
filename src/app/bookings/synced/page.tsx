"use client";

import { useSyncedBookings } from "@/features/services/bookings/useSyncedBookings";
import LocationFilters from "@/components/LocationFilters";
import Pagination from "@/components/Pagination";
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  RefreshCw,
  RotateCcw,
  User,
  X,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const SyncedBookingsReport: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("all");
  const [locationFilters, setLocationFilters] = useState<{
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    facility_id?: string;
  }>({});

  const { 
    syncedBookings, 
    pagination, 
    isLoading, 
    error, 
    refetchSyncedBookings 
  } = useSyncedBookings({
    page: currentPage,
    filters: locationFilters,
  });

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (!syncedBookings) return [];
    if (activeTab === "all") return syncedBookings;
    return syncedBookings.filter(
      (syncedBooking) => syncedBooking.synch_status === activeTab
    );
  }, [syncedBookings, activeTab]);

  // Count bookings by status
  const statusCounts = useMemo(() => {
    if (!syncedBookings) return { all: 0, complete: 0, pending: 0, failed: 0 };

    const counts = syncedBookings.reduce(
      (acc, syncedBooking) => {
        const status = syncedBooking.synch_status || "pending";
        acc[status as keyof typeof acc]++;
        acc.all++;
        return acc;
      },
      { all: 0, complete: 0, pending: 0, failed: 0 }
    );

    return counts;
  }, [syncedBookings]);

  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "complete", label: "Complete", count: statusCounts.complete },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "failed", label: "Failed", count: statusCounts.failed },
  ];

  const toggleExpandRow = (bookingId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      complete: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      failed: { color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig["pending"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
              Error loading synced bookings
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!syncedBookings || syncedBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No synced bookings found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No synced bookings have been processed yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <RotateCcw className="h-5 w-5 mr-2 text-blue-600" />
            Synched to SHA
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => refetchSyncedBookings()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <span className="text-sm text-gray-500">
              ({filteredBookings.length} bookings)
            </span>
          </div>
        </div>

        {/* Location Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg overflow-visible">
          <LocationFilters
            onLocationChange={setLocationFilters}
            showFacilityFilter={true}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab === "all" ? "" : activeTab} synced bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "all"
                ? "No synced bookings have been processed yet."
                : `No ${activeTab} synced bookings at the moment.`}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking & Patient Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SHA Number & Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost Breakdown
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sync Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((syncedBooking) => (
                    <React.Fragment key={syncedBooking.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {syncedBooking.booking.patient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {syncedBooking.booking.patient.phone}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {syncedBooking.booking.booking_number}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(syncedBooking.booking.booking_date)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal break-words">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">
                              {syncedBooking.booking.patient.sha_number || "N/A"}
                            </div>
                            <div className="text-gray-500 mt-1">
                              <CreditCard className="inline h-3 w-3 mr-1" />
                              {syncedBooking.booking.payment_mode || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="text-xs text-gray-600 space-y-0.5">
                              <div className="flex justify-between items-center">
                                <span className="text-blue-600">Amount:</span>
                                <span className="font-medium">
                                  {formatCurrency(syncedBooking.booking.amount)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-green-600">
                                  Vendor Share:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    syncedBooking.booking.vendor_share
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-purple-600">
                                  Facility Share:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    syncedBooking.booking.facility_share
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {getStatusBadge(syncedBooking.synch_status)}
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Synced: {formatDate(syncedBooking.synched_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleExpandRow(syncedBooking.id)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {expandedRows.has(syncedBooking.id) ? "Hide" : "Details"}
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(syncedBooking.id) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <User className="h-4 w-4 mr-2" />
                                  Patient Details
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-gray-500">DOB:</span>{" "}
                                    {new Date(
                                      syncedBooking.booking.patient.date_of_birth
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">SHA Number:</span>{" "}
                                    {syncedBooking.booking.patient.sha_number || "N/A"}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Patient ID:</span>{" "}
                                    {syncedBooking.booking.patient.id.slice(-8)}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Booking Status
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-gray-500">Booking Status:</span>{" "}
                                    <span className="capitalize">
                                      {syncedBooking.booking.booking_status}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Service Status:</span>{" "}
                                    <span className="capitalize">
                                      {syncedBooking.booking.service_status}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Approval Status:</span>{" "}
                                    <span className="capitalize">
                                      {syncedBooking.booking.approval_status}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Detailed Cost Breakdown
                                </h4>
                                <div className="text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-blue-600 font-medium">
                                      Total Amount:
                                    </span>
                                    <span className="font-semibold">
                                      {formatCurrency(syncedBooking.booking.amount)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-green-600 font-medium">
                                      Vendor Share:
                                    </span>
                                    <span className="font-semibold">
                                      {formatCurrency(
                                        syncedBooking.booking.vendor_share
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-purple-600 font-medium">
                                      Facility Share:
                                    </span>
                                    <span className="font-semibold">
                                      {formatCurrency(
                                        syncedBooking.booking.facility_share
                                      )}
                                    </span>
                                  </div>
                                  <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 text-xs">
                                        Payment Mode:
                                      </span>
                                      <span className="text-xs">
                                        {syncedBooking.booking.payment_mode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Sync Information
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <span className="text-gray-500">Sync Status:</span>{" "}
                                    {getStatusBadge(syncedBooking.synch_status)}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Synced At:</span>{" "}
                                    {formatDate(syncedBooking.synched_at)}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Created:</span>{" "}
                                    {formatDate(syncedBooking.created_at)}
                                  </p>
                                  <p>
                                    <span className="text-gray-500">Updated:</span>{" "}
                                    {formatDate(syncedBooking.updated_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  lastPage={pagination.totalPages}
                  total={pagination.total}
                  from={pagination.from}
                  to={pagination.to}
                  links={[]}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SyncedBookingsReport;
