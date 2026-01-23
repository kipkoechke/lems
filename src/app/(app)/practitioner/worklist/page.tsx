"use client";

import { useState } from "react";
import { useWorklist } from "@/features/worklist/useWorklist";
import { useRouter } from "next/navigation";
import {
  MdSearch,
  MdFilterList,
  MdCalendarToday,
  MdPerson,
  MdMedicalServices,
  MdAccessTime,
  MdCheckCircle,
  MdPlayCircle,
  MdPending,
  MdCancel,
} from "react-icons/md";
import { FaStethoscope, FaHospital } from "react-icons/fa";
import BackButton from "@/components/common/BackButton";
import Pagination from "@/components/common/Pagination";
import { maskPhoneNumber } from "@/lib/maskUtils";
import type { WorklistBooking, WorklistService } from "@/types/worklist";

const statusConfig = {
  not_started: {
    label: "Not Started",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: MdPending,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: MdPlayCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: MdCheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: MdCancel,
  },
};

const bookingStatusConfig = {
  pending_otp: {
    label: "Pending OTP",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  active: {
    label: "Active",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function PractitionerWorklistPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, error } = useWorklist({
    page,
    per_page: 15,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const bookings = data?.data || [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    // Handle "YYYY-MM-DD HH:mm" format
    if (dateString.includes(" ") && !dateString.includes("T")) {
      const [, time] = dateString.split(" ");
      return time;
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleServiceClick = (booking: WorklistBooking, service: WorklistService) => {
    // Navigate to service fulfillment page
    router.push(`/lab/complete-service?booking_id=${booking.id}&service_id=${service.id}`);
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Worklist</h1>
            <p className="text-sm text-slate-500">
              Manage your assigned services and bookings
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdMedicalServices className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Total Bookings</p>
              <p className="text-sm font-medium text-slate-900">
                {summary.total_bookings}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdPerson className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Unique Patients</p>
              <p className="text-sm font-medium text-slate-900">
                {summary.unique_patients}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdCalendarToday className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Today</p>
              <p className="text-sm font-medium text-slate-900">{summary.today}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
              <FaStethoscope className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Total Revenue</p>
              <p className="text-sm font-medium text-slate-900">
                KES {parseFloat(summary.total_tariff).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, booking number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <MdFilterList className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending_otp">Pending OTP</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Summary Badges */}
      {summary && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <MdPending className="w-3.5 h-3.5" />
            Pending OTP: {summary.by_status.pending_otp}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <MdPlayCircle className="w-3.5 h-3.5" />
            Active: {summary.by_status.active}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MdCheckCircle className="w-3.5 h-3.5" />
            Completed: {summary.by_status.completed}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <MdCancel className="w-3.5 h-3.5" />
            Cancelled: {summary.by_status.cancelled}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          Failed to load worklist. Please try again.
        </div>
      )}

      {/* Bookings List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
              <MdMedicalServices className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No bookings found in your worklist</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden"
              >
                {/* Booking Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MdPerson className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {booking.patient.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {booking.booking_number} • {maskPhoneNumber(booking.patient.phone)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bookingStatusConfig[booking.status]?.color || "bg-slate-50 text-slate-700"}`}
                      >
                        {bookingStatusConfig[booking.status]?.label || booking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient & Payment Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs">ID No.</span>
                      <p className="font-medium text-slate-900">
                        {booking.patient.identification_no}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Facility</span>
                      <p className="font-medium text-slate-900 truncate">
                        {booking.facility.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Total Tariff</span>
                      <p className="font-medium text-slate-900">
                        KES {parseFloat(booking.payment.tariff).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Services</span>
                      <p className="font-medium text-slate-900">
                        {booking.completed_count}/{booking.services_count} completed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Services List */}
                <div className="divide-y divide-slate-100">
                  {booking.services.map((service) => {
                    const status = statusConfig[service.status];
                    const StatusIcon = status?.icon || MdPending;

                    return (
                      <div
                        key={service.id}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleServiceClick(booking, service)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center">
                              <FaStethoscope className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {service.service.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {service.service.code} • LOT {service.lot.number}: {service.lot.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Scheduled</p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatDate(service.scheduled_date)}{" "}
                                <span className="text-slate-500">
                                  {formatTime(service.scheduled_date)}
                                </span>
                              </p>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status?.color || "bg-slate-50 text-slate-700"}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {status?.label || service.status}
                            </span>
                          </div>
                        </div>

                        {/* Equipment & Practitioner Info */}
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          {service.equipment && (
                            <span className="flex items-center gap-1">
                              <FaHospital className="w-3 h-3" />
                              {service.equipment.name}
                            </span>
                          )}
                          {service.practitioner && (
                            <span className="flex items-center gap-1">
                              <MdPerson className="w-3 h-3" />
                              {service.practitioner.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            KES {parseFloat(service.tariff).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Booking Footer */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Created by: {booking.created_by.name}
                    </span>
                    <span>
                      {formatDate(booking.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
