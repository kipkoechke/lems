"use client";

import { useSyncedBookings } from "@/features/services/bookings/useSyncedBookings";
import { useCreateBatch } from "@/features/services/bookings/useCreateBatch";
import Pagination from "@/components/Pagination";
import {
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  DollarSign,
  Eye,
  MinusSquare,
  RefreshCw,
  RotateCcw,
  Square,
  User,
  X,
  XCircle,
  Send,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const SyncedBookingsReport: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedSyncIds, setSelectedSyncIds] = useState<Set<string>>(new Set());
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                                onClick={() => handleSelectSyncBooking(syncedBooking.id)}
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
                                <span className="font-medium">Phone:</span>{" "}
                                {syncedBooking.booking.patient.phone}
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
                              <div className="text-xs text-gray-400">
                                <span className="font-medium">DOB:</span>{" "}
                                {new Date(
                                  syncedBooking.booking.patient.date_of_birth
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal break-words">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium text-blue-600 mb-2">
                              Booking No: {syncedBooking.booking.booking_number}
                            </div>
                            <div className="text-gray-700">
                              <span className="font-medium">Service Date:</span>{" "}
                              {formatDate(syncedBooking.booking.booking_date)}
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
                                  {formatCurrency(syncedBooking.booking.amount)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">
                                  Vendor Share:
                                </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(
                                    syncedBooking.booking.vendor_share
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">
                                  Facility Share:
                                </span>
                                <span className="font-medium text-purple-600">
                                  {formatCurrency(
                                    syncedBooking.booking.facility_share
                                  )}
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
                                {formatDate(syncedBooking.synched_at)}
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
                            {expandedRows.has(syncedBooking.id)
                              ? "Hide"
                              : "Details"}
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(syncedBooking.id) && (
                        <tr>
                          <td colSpan={eligibleForBatch.length > 0 ? 6 : 5} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* Patient Information Card */}
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <User className="h-4 w-4 mr-2 text-blue-600" />
                                  Patient Information
                                </h4>
                                <div className="text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Name:
                                    </span>
                                    <span className="text-gray-900">
                                      {syncedBooking.booking.patient.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Phone:
                                    </span>
                                    <span className="text-gray-900">
                                      {syncedBooking.booking.patient.phone}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      DOB:
                                    </span>
                                    <span className="text-gray-900">
                                      {new Date(
                                        syncedBooking.booking.patient.date_of_birth
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      SHA Number:
                                    </span>
                                    <span
                                      className={
                                        syncedBooking.booking.patient.sha_number
                                          ? "text-green-600 font-medium"
                                          : "text-gray-400"
                                      }
                                    >
                                      {syncedBooking.booking.patient
                                        .sha_number || "Not Available"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Patient ID:
                                    </span>
                                    <span className="text-gray-900 font-mono text-xs">
                                      {syncedBooking.booking.patient.id.slice(
                                        -12
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Booking Information Card */}
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                                  Booking Information
                                </h4>
                                <div className="text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Booking Number:
                                    </span>
                                    <span className="text-blue-600 font-mono text-xs font-medium">
                                      {syncedBooking.booking.booking_number}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Service Date:
                                    </span>
                                    <span className="text-gray-900">
                                      {formatDate(
                                        syncedBooking.booking.booking_date
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Payment Mode:
                                    </span>
                                    <span className="text-gray-900 capitalize">
                                      {syncedBooking.booking.payment_mode}
                                    </span>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <div className="grid grid-cols-1 gap-1">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 text-xs">
                                          Booking Status:
                                        </span>
                                        <span className="text-blue-600 text-xs capitalize font-medium">
                                          {syncedBooking.booking.booking_status}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 text-xs">
                                          Service Status:
                                        </span>
                                        <span className="text-green-600 text-xs capitalize font-medium">
                                          {syncedBooking.booking.service_status}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 text-xs">
                                          Approval Status:
                                        </span>
                                        <span className="text-purple-600 text-xs capitalize font-medium">
                                          {
                                            syncedBooking.booking
                                              .approval_status
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Financial Details Card */}
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                                  Financial Breakdown
                                </h4>
                                <div className="text-sm space-y-3">
                                  <div className="bg-blue-50 p-2 rounded">
                                    <div className="flex justify-between items-center">
                                      <span className="text-blue-700 font-medium">
                                        Total Amount:
                                      </span>
                                      <span className="font-bold text-blue-800 text-lg">
                                        {formatCurrency(
                                          syncedBooking.booking.amount
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-green-600 font-medium">
                                        Vendor Share:
                                      </span>
                                      <span className="font-semibold text-green-700">
                                        {formatCurrency(
                                          syncedBooking.booking.vendor_share
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-purple-600 font-medium">
                                        Facility Share:
                                      </span>
                                      <span className="font-semibold text-purple-700">
                                        {formatCurrency(
                                          syncedBooking.booking.facility_share
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                      <span className="font-medium">
                                        Payment Method:
                                      </span>{" "}
                                      <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                                        {syncedBooking.booking.payment_mode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Sync Information Card */}
                              <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                  <RotateCcw className="h-4 w-4 mr-2 text-orange-600" />
                                  Sync Information
                                </h4>
                                <div className="text-sm space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">
                                      Sync Status:
                                    </span>
                                    <div>
                                      {getStatusBadge(
                                        syncedBooking.synch_status
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Synced At:
                                    </span>
                                    <span className="text-gray-900 text-xs">
                                      {formatDate(syncedBooking.synched_at)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Created:
                                    </span>
                                    <span className="text-gray-900 text-xs">
                                      {formatDate(syncedBooking.created_at)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500 font-medium">
                                      Last Updated:
                                    </span>
                                    <span className="text-gray-900 text-xs">
                                      {formatDate(syncedBooking.updated_at)}
                                    </span>
                                  </div>
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                      <span className="font-medium">
                                        Sync ID:
                                      </span>{" "}
                                      <span className="font-mono">
                                        {syncedBooking.id.slice(-12)}
                                      </span>
                                    </div>
                                  </div>
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
