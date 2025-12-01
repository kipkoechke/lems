"use client";

import { useBookings } from "@/features/services/bookings/useBookings";
import {
  Building,
  Calendar,
  Check,
  CreditCard,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";
import React, { useState } from "react";
import { maskPhoneNumber } from "@/lib/maskUtils";
import { Bookings } from "@/services/apiBooking";
import { useCurrentFacility } from "@/hooks/useAuth";

const ConfirmedBookingsPage: React.FC = () => {
  const facility = useCurrentFacility();
  const code = facility?.code || "";

  const { isLoading, bookings, error } = useBookings({
    booking_status: "confirmed",
    code: code,
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const getApprovalStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending Approval",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
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
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading confirmed bookings
            </h3>
            <div className="mt-2 text-sm text-red-700">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No confirmed bookings found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no confirmed bookings at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Confirmed Bookings
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              List of confirmed bookings for your facility
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-1" />
              {bookings.length} Confirmed
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking: Bookings) => (
                <React.Fragment key={booking.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpandRow(booking.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.booking_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.services?.length || 0} service(s)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.patient?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maskPhoneNumber(booking.patient?.phone || "")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(booking.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 capitalize">
                          {booking.payment_mode || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApprovalStatusBadge(booking.approval_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandRow(booking.id);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedRows.has(booking.id)
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row - Service Details */}
                  {expandedRows.has(booking.id) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Service Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {booking.services?.map((service, index) => (
                              <div
                                key={service.id || index}
                                className="bg-white rounded-lg border border-gray-200 p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {service.service?.service?.name ||
                                        "Unknown Service"}
                                    </h5>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Code:{" "}
                                      {service.service?.service?.code || "N/A"}
                                    </p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      service.service_status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {service.service_status === "completed" ? (
                                      <Check className="w-3 h-3 mr-1" />
                                    ) : (
                                      <Clock className="w-3 h-3 mr-1" />
                                    )}
                                    {service.service_status === "completed"
                                      ? "Completed"
                                      : "Pending"}
                                  </span>
                                </div>

                                <div className="mt-3 space-y-2">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Building className="w-3 h-3 mr-1" />
                                    <span>
                                      {service.service?.contract?.facility
                                        ?.name || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>
                                      {formatDate(service.booking_date)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">
                                      SHA Rate:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(
                                        service.service?.service?.sha_rate || 0
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs mt-1">
                                    <span className="text-gray-500">
                                      Facility Share:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(service.facility_share)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs mt-1">
                                    <span className="text-gray-500">
                                      Vendor Share:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(service.vendor_share)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {(!booking.services ||
                            booking.services.length === 0) && (
                            <p className="text-sm text-gray-500 italic">
                              No services found for this booking.
                            </p>
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
      </div>
    </div>
  );
};

export default ConfirmedBookingsPage;
