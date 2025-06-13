"use client";

import { useApproveBooking } from "@/features/services/bookings/useApproveBooking";
import { useBookings } from "@/features/services/bookings/useBookings";
import { useRejectBooking } from "@/features/services/bookings/useRejectBooking";
import {
  Building,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  User,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const BookingReport: React.FC = () => {
  const { isLoading, bookings, error, refetchBookings } = useBookings();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>("all");
  const { approve, isApproving } = useApproveBooking();
  const { reject, isRejecting } = useRejectBooking();
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  // Filter bookings based on active tab
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeTab === "all") return bookings;
    return bookings.filter((booking) => booking.approval === activeTab);
  }, [bookings, activeTab]);

  // Count bookings by status
  const statusCounts = useMemo(() => {
    if (!bookings) return { all: 0, pending: 0, approved: 0, rejected: 0 };

    const counts = bookings.reduce(
      (acc, booking) => {
        acc[booking.approval as keyof typeof acc]++;
        acc.all++;
        return acc;
      },
      { all: 0, pending: 0, approved: 0, rejected: 0 }
    );

    return counts;
  }, [bookings]);

  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "approved", label: "Approved", count: statusCounts.approved },
    { id: "rejected", label: "Rejected", count: statusCounts.rejected },
  ];

  const handleApproval = (bookingId: string) => {
    setApprovingIds((prev) => new Set(prev).add(bookingId));
    approve(bookingId, {
      onSettled: () => {
        setApprovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bookingId);
          return newSet;
        });
        refetchBookings();
      },
    });
  };

  const handleRejection = (bookingId: string) => {
    setApprovingIds((prev) => new Set(prev).add(bookingId));
    reject(bookingId, {
      onSettled: () => {
        setApprovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(bookingId);
          return newSet;
        });
        refetchBookings();
      },
    });
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
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", icon: Check },
      rejected: { color: "bg-red-100 text-red-800", icon: X },
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
              Error loading bookings
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No bookings found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No bookings have been made yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Services
          </h3>
          <span className="text-sm text-gray-500">
            ({filteredBookings.length} bookings)
          </span>
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
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab === "all" ? "" : activeTab} bookings found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "all"
                ? "No bookings have been made yet."
                : `No ${activeTab} bookings at the moment.`}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient & Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service & Facility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Breakdown & Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <React.Fragment key={booking.bookingId}>
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
                              {booking.patient.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.patient.mobileNumber}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(booking.bookingDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal break-words">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium break-words">
                            {booking.service.serviceName}
                          </div>
                          <div className="text-gray-500 break-words">
                            {booking.service.category.categoryName}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 break-words">
                            <Building className="inline h-3 w-3 mr-1" />
                            {booking.facility.facilityName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-600">SHA Rate:</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  booking.service.shaRate || booking.cost
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-600">
                                Vendor Share:
                              </span>
                              <span className="font-medium">
                                {formatCurrency(
                                  booking.service.vendorShare || "0"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-purple-600">
                                Facility Share:
                              </span>
                              <span className="font-medium">
                                {formatCurrency(
                                  booking.service.facilityShare || "0"
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            <CreditCard className="inline h-3 w-3 mr-1" />
                            Payment Mode: {booking.paymentMode.paymentModeName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.approval)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleExpandRow(booking.bookingId)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {expandedRows.has(booking.bookingId)
                            ? "Hide"
                            : "Details"}
                        </button>

                        {booking.approval === "pending" && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleApproval(booking.bookingId)}
                              disabled={
                                approvingIds.has(booking.bookingId) ||
                                isApproving
                              }
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm inline-flex items-center"
                            >
                              {approvingIds.has(booking.bookingId) ||
                              isApproving ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejection(booking.bookingId)}
                              disabled={isRejecting}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm inline-flex items-center"
                            >
                              {isRejecting ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {expandedRows.has(booking.bookingId) && (
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
                                  <span className="text-gray-500">DOB:</span>
                                  {new Date(
                                    booking.patient.dateOfBirth
                                  ).toLocaleDateString()}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Patient ID:
                                  </span>
                                  {booking.patient.patientId.slice(-8)}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                Facility Details
                              </h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="text-gray-500">Code:</span>
                                  {booking.facility.facilityCode}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Contact:
                                  </span>
                                  {booking.facility.contactInfo}
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
                                    SHA Rate:
                                  </span>
                                  <span className="font-semibold">
                                    {formatCurrency(booking.service.shaRate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-green-600 font-medium">
                                    Vendor Share:
                                  </span>
                                  <span className="font-semibold">
                                    {booking.service.vendorShare}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-purple-600 font-medium">
                                    Facility Share:
                                  </span>
                                  <span className="font-semibold">
                                    {formatCurrency(
                                      booking.service.facilityShare
                                    )}
                                  </span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-900 font-bold">
                                      Total Cost:
                                    </span>
                                    <span className="font-bold text-lg">
                                      {formatCurrency(booking.cost)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2 lg:col-span-3">
                                <h4 className="font-medium text-gray-900 mb-2">
                                  Notes
                                </h4>
                                <p className="text-sm text-gray-700">
                                  {booking.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingReport;
