"use client";

import { useSyncedBookings } from "@/features/services/bookings/useSyncedBookings";
import { useCreateBatch } from "@/features/services/bookings/useCreateBatch";
import { useVendorBatches } from "@/features/services/bookings/useVendorBatches";
import { useFacilityPayments } from "@/features/services/bookings/useFacilityPayments";
import Pagination from "@/components/common/Pagination";
import {
  CheckCircle,
  CheckSquare,
  Clock,
  MinusSquare,
  RefreshCw,
  RotateCcw,
  Square,
  X,
  XCircle,
  Send,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { maskPhoneNumber } from "@/lib/maskUtils";

// Helper functions
const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Calculate total amounts from services
const calculateTotalAmounts = (services: any[]) => {
  return services.reduce(
    (totals, service) => {
      totals.vendorShare += parseFloat(service.vendor_share || "0");
      totals.facilityShare += parseFloat(service.facility_share || "0");
      totals.total = totals.vendorShare + totals.facilityShare;
      return totals;
    },
    { vendorShare: 0, facilityShare: 0, total: 0 }
  );
};

const SyncedBookingsReport: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedSyncIds, setSelectedSyncIds] = useState<Set<string>>(
    new Set()
  );
  // Location filters removed

  const {
    syncedBookings,
    pagination,
    isLoading,
    error,
    refetchSyncedBookings,
  } = useSyncedBookings({
    page: currentPage,
    // Location filters removed
  });

  const { createBatch, isCreating } = useCreateBatch();

  const {
    vendorBatches,
    pagination: vendorPagination,
    isLoading: isLoadingVendorBatches,
    error: vendorBatchesError,
  } = useVendorBatches({
    page: currentPage,
  });

  const {
    data: facilityPaymentsData,
    isLoading: isLoadingFacilityPayments,
    error: facilityPaymentsError,
  } = useFacilityPayments(currentPage);

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (!syncedBookings) return [];
    if (activeTab === "all") return syncedBookings;
    return syncedBookings.filter(
      (syncedBooking) => syncedBooking.synch_status === activeTab
    );
  }, [syncedBookings, activeTab]);

  // Get bookings eligible for batch creation (batch_id is null)
  const eligibleForBatch = useMemo(() => {
    return filteredBookings.filter(
      (syncedBooking) => syncedBooking.batch_id === null
    );
  }, [filteredBookings]);

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
    {
      id: "vendor-payment",
      label: "Vendor Payment",
      count: vendorBatches?.length || 0,
    },
    {
      id: "facility-payment",
      label: "Facility Payment",
      count: facilityPaymentsData?.data?.length || 0,
    },
  ];

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedSyncIds.size === eligibleForBatch.length) {
      // If all are selected, deselect all
      setSelectedSyncIds(new Set());
    } else {
      // Select all eligible sync bookings
      setSelectedSyncIds(new Set(eligibleForBatch.map((sb) => sb.id)));
    }
  };

  const handleSelectSyncBooking = (syncId: string) => {
    setSelectedSyncIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(syncId)) {
        newSet.delete(syncId);
      } else {
        newSet.add(syncId);
      }
      return newSet;
    });
  };

  const handleCreateBatch = async () => {
    const selectedIds = Array.from(selectedSyncIds);
    if (selectedIds.length === 0) {
      return;
    }

    createBatch(
      { sync_ids: selectedIds },
      {
        onSuccess: () => {
          setSelectedSyncIds(new Set());
          refetchSyncedBookings();
        },
      }
    );
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

  // Get the appropriate icon for select all checkbox
  const getSelectAllIcon = () => {
    if (selectedSyncIds.size === 0) return Square;
    if (selectedSyncIds.size === eligibleForBatch.length) return CheckSquare;
    return MinusSquare; // Partial selection
  };

  const SelectAllIcon = getSelectAllIcon();

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
          {/* Location Filters removed */}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedSyncIds(new Set()); // Clear selection when switching tabs
                }}
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

        {/* Bulk Actions Bar */}
        {eligibleForBatch.length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <SelectAllIcon className="h-4 w-4 mr-2" />
                  {selectedSyncIds.size === 0
                    ? "Select All"
                    : selectedSyncIds.size === eligibleForBatch.length
                    ? "Deselect All"
                    : `Select All (${selectedSyncIds.size} selected)`}
                </button>
                {selectedSyncIds.size > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedSyncIds.size} of {eligibleForBatch.length} eligible
                    bookings selected for batch processing
                  </span>
                )}
              </div>

              {selectedSyncIds.size > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateBatch}
                    disabled={isCreating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm inline-flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Creating Batch...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Batch ({selectedSyncIds.size})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "vendor-payment" ? (
          // Vendor Payment Tab Content
          <>
            {isLoadingVendorBatches ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : vendorBatchesError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <X className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading vendor batches
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {vendorBatchesError.message}
                    </div>
                  </div>
                </div>
              </div>
            ) : vendorBatches.length === 0 ? (
              <div className="text-center py-12">
                <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No vendor payment batches found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No vendor payment batches have been created yet.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch Information
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount & Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Range
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendorBatches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-normal break-words">
                            <div className="text-sm text-gray-900">
                              <div className="mb-3">
                                <div className="font-medium text-black mb-1">
                                  Batch No:
                                </div>
                                <div className="text-gray-500 mb-3">
                                  {batch.batch_no}
                                </div>
                                <div className="font-medium text-black mb-1">
                                  Date Batched:
                                </div>
                                <div className="text-gray-500">
                                  {formatDate(batch.created_at)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {batch.vendor.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-black">
                                  Code:
                                </span>{" "}
                                <span className="text-gray-500">
                                  {batch.vendor.code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 text-xs font-medium">
                                    Total Amount:
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    {formatCurrency(batch.amount)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 text-xs">
                                    Status:
                                  </span>
                                  <span
                                    className={`font-medium text-xs px-2 py-1 rounded-full ${
                                      batch.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : batch.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {batch.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500">
                                <div className="font-medium text-gray-700 mb-1">
                                  Start Date:
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(batch.start_date)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                <div className="font-medium text-gray-700 mb-1">
                                  End Date:
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(batch.end_date)}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vendor Payment Pagination */}
                {vendorPagination && vendorPagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={vendorPagination.currentPage}
                      lastPage={vendorPagination.totalPages}
                      total={vendorPagination.total}
                      from={vendorPagination.from}
                      to={vendorPagination.to}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </>
        ) : activeTab === "facility-payment" ? (
          // Facility Payment Tab Content
          <>
            {isLoadingFacilityPayments ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : facilityPaymentsError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <X className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading facility payments
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {facilityPaymentsError.message}
                    </div>
                  </div>
                </div>
              </div>
            ) : !facilityPaymentsData ||
              facilityPaymentsData.data.length === 0 ? (
              <div className="text-center py-12">
                <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No facility payment batches found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No facility payment batches have been created yet.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch Information
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Facility Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount & Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Range
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {facilityPaymentsData.data.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-normal break-words">
                            <div className="text-sm text-gray-900">
                              <div className="mb-3">
                                <div className="font-medium text-black mb-1">
                                  Batch No:
                                </div>
                                <div className="text-gray-500 mb-3">
                                  {payment.batch_no}
                                </div>
                                <div className="font-medium text-black mb-1">
                                  Date Created:
                                </div>
                                <div className="text-gray-500">
                                  {formatDate(payment.created_at)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.facility.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-black">
                                  Code:
                                </span>{" "}
                                <span className="text-gray-500">
                                  {payment.facility.code}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {payment.facility.facility_type}
                              </div>
                              <div className="text-xs text-gray-400">
                                {payment.facility.keph_level}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="bg-purple-50 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 text-xs font-medium">
                                    Amount:
                                  </span>
                                  <span className="font-bold text-purple-600">
                                    {formatCurrency(payment.amount)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 text-xs">
                                    Owner:
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {payment.facility.owner}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600 text-xs">
                                    Status:
                                  </span>
                                  <span className="text-xs text-green-600 font-medium">
                                    {payment.facility.operation_status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="text-xs text-gray-500">
                                <div className="font-medium text-gray-700 mb-1">
                                  Start Date:
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(payment.start_date)}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                <div className="font-medium text-gray-700 mb-1">
                                  End Date:
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(payment.end_date)}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Facility Payment Pagination */}
                {facilityPaymentsData &&
                  facilityPaymentsData.total >
                    facilityPaymentsData.per_page && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={facilityPaymentsData.current_page}
                        lastPage={facilityPaymentsData.last_page}
                        total={facilityPaymentsData.total}
                        from={facilityPaymentsData.from}
                        to={facilityPaymentsData.to}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
              </>
            )}
          </>
        ) : filteredBookings.length === 0 ? (
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
                    {eligibleForBatch.length > 0 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center hover:text-gray-700"
                        >
                          <SelectAllIcon className="h-4 w-4" />
                        </button>
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial Breakdown
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sync Status & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((syncedBooking) => (
                    <React.Fragment key={syncedBooking.id}>
                      <tr className="hover:bg-gray-50">
                        {eligibleForBatch.length > 0 && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {syncedBooking.batch_id === null ? (
                              <button
                                onClick={() =>
                                  handleSelectSyncBooking(syncedBooking.id)
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {selectedSyncIds.has(syncedBooking.id) ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <div className="w-4 h-4 flex items-center justify-center">
                                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                  Batched
                                </span>
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {syncedBooking.booking.patient.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">Phone:</span>{" "}
                              {maskPhoneNumber(
                                syncedBooking.booking.patient.phone
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">SHA Number:</span>{" "}
                              <span
                                className={
                                  syncedBooking.booking.patient.sha_number
                                    ? "text-green-600 font-medium"
                                    : "text-gray-400"
                                }
                              >
                                {syncedBooking.booking.patient.sha_number ||
                                  "Not Available"}
                              </span>
                            </div>
                            {syncedBooking.booking.patient
                              .identification_no && (
                              <div className="text-xs text-gray-400">
                                <span className="font-medium">ID No:</span>{" "}
                                {
                                  syncedBooking.booking.patient
                                    .identification_no
                                }
                              </div>
                            )}
                            {syncedBooking.booking.patient.cr_no && (
                              <div className="text-xs text-gray-400">
                                <span className="font-medium">CR No:</span>{" "}
                                {syncedBooking.booking.patient.cr_no}
                              </div>
                            )}
                            {syncedBooking.booking.patient.hh_no && (
                              <div className="text-xs text-gray-400">
                                <span className="font-medium">HH No:</span>{" "}
                                {syncedBooking.booking.patient.hh_no}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              <span className="font-medium">DOB:</span>{" "}
                              {new Date(
                                syncedBooking.booking.patient.date_of_birth
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal break-words">
                          <div className="text-sm text-gray-900">
                            <div className="mb-3">
                              <div className="font-medium text-black mb-1">
                                Booking No:
                              </div>
                              <div className="text-gray-500">
                                {syncedBooking.booking.booking_number}
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="font-medium text-black mb-1">
                                Service Date:
                              </div>
                              <div className="text-gray-500">
                                {syncedBooking.booking.booking_date
                                  ? formatDate(
                                      syncedBooking.booking.booking_date
                                    )
                                  : syncedBooking.booking.services?.[0]
                                      ?.booking_date
                                  ? formatDate(
                                      syncedBooking.booking.services[0]
                                        .booking_date
                                    )
                                  : "Not Available"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-black mb-1">
                                Services Count:
                              </div>
                              <div className="text-gray-500">
                                {syncedBooking.booking.services?.length || 0}{" "}
                                service(s)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(() => {
                              const totals = calculateTotalAmounts(
                                syncedBooking.booking.services || []
                              );
                              return (
                                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-xs font-medium">
                                      Total Amount:
                                    </span>
                                    <span className="font-bold text-blue-600">
                                      {formatCurrency(totals.total)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-xs">
                                      Vendor Share:
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(totals.vendorShare)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-xs">
                                      Facility Share:
                                    </span>
                                    <span className="font-medium text-purple-600">
                                      {formatCurrency(totals.facilityShare)}
                                    </span>
                                  </div>
                                  <div className="pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-xs">
                                        Payment Mode:
                                      </span>
                                      <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                        {syncedBooking.booking.payment_mode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="flex flex-col items-center">
                              {getStatusBadge(syncedBooking.synch_status)}
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              <div className="font-medium text-gray-700 mb-1">
                                Synced At:
                              </div>
                              <div className="flex items-center justify-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {syncedBooking.synched_at
                                  ? formatDate(syncedBooking.synched_at)
                                  : "Not synced yet"}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
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
