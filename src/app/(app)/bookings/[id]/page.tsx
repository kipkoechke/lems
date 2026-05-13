"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBooking } from "@/services/apiBooking";
import BackButton from "@/components/common/BackButton";
import { ErrorState } from "@/components/common/ErrorState";
import {
  MdPerson,
  MdLocationCity,
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
  MdMedicalServices,
  MdAttachMoney,
} from "react-icons/md";
import type { BookingService } from "@/types/booking";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  pending_otp: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  pending_otp: "Pending OTP",
  pending: "Pending",
};

const SERVICE_STATUS_BADGE: Record<string, string> = {
  not_started: "bg-slate-50 text-slate-600 border-slate-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const SERVICE_STATUS_LABEL: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: string | number | undefined | null) => {
  const num = Number(value ?? 0);
  return num.toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white rounded-lg border border-slate-200" />
              ))}
            </div>
            <div className="h-64 bg-white rounded-lg border border-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <ErrorState
        title="Booking not found"
        error={error}
        action={{ label: "Go Back", onClick: () => router.back() }}
        fullScreen
      />
    );
  }

  const services: BookingService[] = booking.services || booking.booked_services || [];
  const payment = booking.payment;
  const completedServices = services.filter((s) => s.status === "completed").length;
  const pendingServices = services.filter((s) => s.status === "not_started" || s.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {booking.booking_number}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    STATUS_BADGE[booking.status] ?? "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {formatDate(booking.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <MdMedicalServices className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Services</p>
              <p className="text-sm font-medium text-slate-900">{booking.services_count ?? services.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <MdCheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Completed</p>
              <p className="text-sm font-medium text-slate-900">{booking.completed_count ?? completedServices}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <MdPending className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Pending</p>
              <p className="text-sm font-medium text-slate-900">{booking.pending_count ?? pendingServices}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center shrink-0">
              <MdAttachMoney className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Total Tariff</p>
              <p className="text-sm font-medium text-slate-900 truncate">{formatCurrency(payment?.tariff ?? booking.tariff)}</p>
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Patient & Facility info */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MdPerson className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</p>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{booking.patient?.name}</p>
                  <p className="text-xs text-slate-500">{booking.patient?.identification_type ?? "ID"}: {booking.patient?.identification_no}</p>
                </div>
                {booking.patient?.sha_number && (
                  <p className="text-xs text-slate-500">SHA: {booking.patient.sha_number}</p>
                )}
                {booking.patient?.phone && (
                  <p className="text-xs text-slate-500">Phone: {booking.patient.phone}</p>
                )}
              </div>
            </div>

            {/* Facility */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MdLocationCity className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{booking.facility?.name}</p>
                {booking.facility?.fr_code && (
                  <p className="text-xs text-slate-500">FR Code: {booking.facility.fr_code}</p>
                )}
                {booking.source && (
                  <p className="text-xs text-slate-500 capitalize">Source: {booking.source.replace("_", " ")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="border-t border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payment Breakdown</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Tariff", value: payment?.tariff ?? booking.tariff },
                { label: "SHA", value: payment?.sha ?? booking.sha },
                { label: "Cash", value: payment?.cash ?? booking.cash },
                { label: "Other Insurance", value: payment?.other_insurance ?? booking.other_insurance },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="border-t border-slate-100 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Services</p>
              <div className="space-y-3">
                {services.map((svc: BookingService, idx: number) => {
                  const serviceName = svc.service?.name ?? svc.name ?? "—";
                  const serviceCode = svc.service?.code ?? svc.code ?? "";
                  return (
                    <div
                      key={svc.id ?? idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">{serviceName}</p>
                          {serviceCode && (
                            <span className="font-mono text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                              {serviceCode}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                          {svc.scheduled_date && (
                            <span className="flex items-center gap-1">
                              <MdCalendarToday className="w-3 h-3" />
                              {formatDate(svc.scheduled_date)}
                            </span>
                          )}
                          {svc.equipment && (
                            <span>Equipment: {svc.equipment.name}</span>
                          )}
                          {svc.practitioner && (
                            <span>Clinician: {svc.practitioner.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-slate-900">
                          {formatCurrency(svc.tariff)}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                            SERVICE_STATUS_BADGE[svc.status] ?? "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {SERVICE_STATUS_LABEL[svc.status] ?? svc.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer timestamps */}
          <div className="border-t border-slate-100 px-4 py-3 flex flex-wrap gap-4 text-xs text-slate-400">
            <span>Created: {formatDate(booking.created_at)}</span>
            {booking.updated_at && <span>Updated: {formatDate(booking.updated_at)}</span>}
            {booking.finance_approved_at && (
              <span className="text-emerald-600">Finance approved: {formatDate(booking.finance_approved_at)}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
