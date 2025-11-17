"use client";

import { useBookings } from "@/features/services/bookings/useBookings";
import {
  Building,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { maskPhoneNumber } from "@/lib/maskUtils";
import { Bookings } from "@/services/apiBooking";

const BookedServicesPage: React.FC = () => {
  const { isLoading, bookings, error } = useBookings({
    booking_status: "pending",
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
              Error loading booked services
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
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No booked services found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no pending bookings at the moment.
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
              Booked Services
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Pending bookings awaiting finance approval
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-600">Total Pending</p>
              <p className="text-lg font-bold text-yellow-600">
                {bookings.length}
              </p>
            </div>
          </div>
        </div>

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
                  Cost Breakdown
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
              {bookings.map((booking: Bookings) => (
                <React.Fragment key={booking.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.patient.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {maskPhoneNumber(booking.patient.phone)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDate(booking.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words">
                      <div className="text-sm text-gray-900">
                        {booking.services && booking.services.length > 0 ? (
                          <div className="space-y-2">
                            {booking.services.map((service, index) => (
                              <div
                                key={service.id}
                                className="border-l-2 border-blue-200 pl-2"
                              >
                                <div className="font-medium break-words">
                                  {service.service?.service?.name || "N/A"}
                                </div>
                                <div className="text-gray-500 break-words">
                                  {service.service?.service?.code || "N/A"}
                                </div>
                                <div className="text-xs text-gray-400 mt-1 break-words">
                                  <Building className="inline h-3 w-3 mr-1" />
                                  {service.service?.contract?.facility?.name ||
                                    "N/A"}
                                </div>
                                {booking.services.length > 1 &&
                                  index < booking.services.length - 1 && (
                                    <div className="border-b border-gray-100 my-1"></div>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.services && booking.services.length > 0 ? (
                          <div className="space-y-3">
                            {booking.services.map((service, index) => (
                              <div
                                key={service.id}
                                className="border-l-2 border-green-200 pl-2"
                              >
                                <div className="text-xs text-gray-600 space-y-0.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-blue-600">
                                      SHA Rate:
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(
                                        service.service?.service?.sha_rate ||
                                          "0"
                                      )}
                                    </span>
                                  </div>
                                </div>
                                {booking.services.length > 1 &&
                                  index < booking.services.length - 1 && (
                                    <div className="border-b border-gray-100 my-2"></div>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div className="text-xs text-gray-500 mt-2">
                          <CreditCard className="inline h-3 w-3 mr-1" />
                          Payment: {booking.payment_mode || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleExpandRow(booking.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedRows.has(booking.id)
                          ? "Hide Details"
                          : "View Details"}
                      </button>
                    </td>
                  </tr>

                  {expandedRows.has(booking.id) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Patient Details
                              </h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="text-gray-500">DOB: </span>
                                  {new Date(
                                    booking.patient.date_of_birth
                                  ).toLocaleDateString()}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    SHA Number:{" "}
                                  </span>
                                  {booking.patient.sha_number || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <Building className="h-4 w-4 mr-2" />
                                Booking Details
                              </h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="text-gray-500">
                                    Booking #:{" "}
                                  </span>
                                  {booking.booking_number}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Created:{" "}
                                  </span>
                                  {formatDate(booking.created_at)}
                                </p>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Total Cost
                              </h4>
                              <div className="text-sm space-y-1">
                                <p className="text-lg font-semibold text-blue-600">
                                  {formatCurrency(
                                    booking.services?.reduce(
                                      (total, service) =>
                                        total +
                                        parseFloat(
                                          service.service?.service?.sha_rate ||
                                            "0"
                                        ),
                                      0
                                    ) || 0
                                  )}
                                </p>
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
      </div>
    </div>
  );
};

export default BookedServicesPage;
