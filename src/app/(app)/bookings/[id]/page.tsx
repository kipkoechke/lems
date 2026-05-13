"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBooking } from "@/services/apiBooking";
import BackButton from "@/components/common/BackButton";
import { ErrorState } from "@/components/common/ErrorState";
import {
  MdPerson,
  MdLocalHospital,
  MdMedicalServices,
  MdAttachMoney,
  MdVerified,
  MdInfo,
  MdCheckCircle,
  MdRadio,
  MdPending,
  MdPersonPin,
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
  not_started: "bg-slate-100 text-slate-600 border-slate-200",
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

const RESULT_STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  final: "bg-emerald-50 text-emerald-700 border-emerald-200",
  preliminary: "bg-blue-50 text-blue-700 border-blue-200",
};

const formatDate = (dateString: string | undefined | null, dateOnly = false) => {
  if (!dateString) return "-";
  const opts: Intl.DateTimeFormatOptions = dateOnly
    ? { day: "numeric", month: "short", year: "numeric" }
    : { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleDateString("en-GB", opts);
};

const formatCurrency = (value: string | number | undefined | null) => {
  const num = Number(value ?? 0);
  return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-xs text-slate-400 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-900 font-medium flex-1">{value || "-"}</span>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
      <span className="text-slate-400">{icon}</span>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
    </div>
  );
}

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
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-9 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-lg border border-slate-200" />
            ))}
          </div>
          <div className="h-48 bg-white rounded-lg border border-slate-200" />
          <div className="h-80 bg-white rounded-lg border border-slate-200" />
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
  const completedCount = services.filter((s) => s.status === "completed").length;
  const pendingCount = services.filter(
    (s) => s.status === "not_started" || s.status === "in_progress"
  ).length;
  const totalTariff = services.reduce((sum, s) => sum + Number(s.tariff ?? 0), 0);
  const createdByName =
    typeof booking.created_by === "object" && booking.created_by !== null
      ? booking.created_by.name
      : booking.created_by ?? "-";

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-start gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl font-bold text-slate-900">{booking.booking_number}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  STATUS_BADGE[booking.status] ?? "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                {STATUS_LABEL[booking.status] ?? booking.status}
              </span>
              {booking.eligibility_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  <MdVerified className="w-3 h-3" /> Eligibility Verified
                </span>
              )}
              {booking.override && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200">
                  Override
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created {formatDate(booking.created_at)} &middot; Source:{" "}
              <span className="capitalize">{booking.source?.replace(/_/g, " ") ?? "-"}</span>
              {" "}&middot;{" "}By: {createdByName}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {
              icon: <MdMedicalServices className="w-4 h-4 text-blue-600" />,
              bg: "bg-blue-50",
              label: "Services",
              value: booking.services_count ?? services.length,
            },
            {
              icon: <MdCheckCircle className="w-4 h-4 text-emerald-600" />,
              bg: "bg-emerald-50",
              label: "Completed",
              value: booking.completed_count ?? completedCount,
            },
            {
              icon: <MdPending className="w-4 h-4 text-amber-600" />,
              bg: "bg-amber-50",
              label: "Pending",
              value: booking.pending_count ?? pendingCount,
            },
            {
              icon: <MdAttachMoney className="w-4 h-4 text-green-600" />,
              bg: "bg-green-50",
              label: "Total Tariff",
              value: formatCurrency(payment?.tariff ?? totalTariff),
            },
          ].map(({ icon, bg, label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Patient + Facility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <SectionHeader icon={<MdPerson className="w-4 h-4" />} title="Patient" />
            <InfoRow label="Full Name" value={booking.patient?.name} />
            <InfoRow label="ID Number" value={booking.patient?.identification_no} />
            {booking.patient?.sha_number && (
              <InfoRow label="SHA Number" value={booking.patient.sha_number} />
            )}
            {booking.patient?.phone && (
              <InfoRow label="Phone" value={booking.patient.phone} />
            )}
            {booking.patient?.date_of_birth && (
              <InfoRow label="Date of Birth" value={formatDate(booking.patient.date_of_birth, true)} />
            )}
            {booking.patient?.gender && (
              <InfoRow label="Gender" value={booking.patient.gender} />
            )}
          </div>

          {/* Facility */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <SectionHeader icon={<MdLocalHospital className="w-4 h-4" />} title="Facility" />
            <InfoRow label="Name" value={booking.facility?.name} />
            <InfoRow label="FR Code" value={booking.facility?.fr_code} />
            <InfoRow
              label="Source"
              value={
                <span className="capitalize">{booking.source?.replace(/_/g, " ")}</span>
              }
            />
            {booking.notes && <InfoRow label="Notes" value={booking.notes} />}
            <InfoRow
              label="Finance Approved"
              value={
                booking.finance_approved_at ? (
                  <span className="text-emerald-600">{formatDate(booking.finance_approved_at)}</span>
                ) : (
                  <span className="text-slate-400 text-xs">Not approved</span>
                )
              }
            />
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <SectionHeader icon={<MdAttachMoney className="w-4 h-4" />} title="Payment Breakdown" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Tariff", value: payment?.tariff ?? booking.tariff, color: "text-slate-900" },
              { label: "SHA", value: payment?.sha ?? booking.sha, color: "text-blue-700" },
              { label: "Cash", value: payment?.cash ?? booking.cash, color: "text-emerald-700" },
              { label: "Other Insurance", value: payment?.other_insurance ?? booking.other_insurance, color: "text-purple-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <SectionHeader
              icon={<MdMedicalServices className="w-4 h-4" />}
              title={`Services (${services.length})`}
            />
            <div className="space-y-4">
              {services.map((svc, idx) => {
                const serviceName = svc.service?.name ?? svc.name ?? "-";
                const serviceCode = svc.service?.code ?? svc.code ?? "";
                const svcPayment = svc.payment as
                  | { cash?: string; sha?: string; other_insurance?: string }
                  | undefined;

                return (
                  <div key={svc.id ?? idx} className="rounded-lg border border-slate-200 overflow-hidden">
                    {/* Service header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        {svc.lot && (
                          <span className="shrink-0 text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded">
                            Lot {svc.lot.number}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-slate-900 truncate">{serviceName}</span>
                        {serviceCode && (
                          <span className="shrink-0 font-mono text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {serviceCode}
                          </span>
                        )}
                        {svc.lot && (
                          <span className="hidden sm:inline text-xs text-slate-400 truncate">
                            {svc.lot.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(svc.tariff)}
                        </span>
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            SERVICE_STATUS_BADGE[svc.status] ??
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {SERVICE_STATUS_LABEL[svc.status] ?? svc.status}
                        </span>
                      </div>
                    </div>

                    {/* Service body */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
                      {/* Scheduling */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 mt-1">
                          Scheduling
                        </p>
                        <InfoRow
                          label="Date"
                          value={svc.scheduled_date ? formatDate(svc.scheduled_date, true) : undefined}
                        />
                        <InfoRow label="Started" value={formatDate(svc.started_at)} />
                        <InfoRow label="Completed" value={formatDate(svc.completed_at)} />
                        {svc.cancel_reason && (
                          <InfoRow label="Cancel Reason" value={svc.cancel_reason} />
                        )}
                        {svc.notes && <InfoRow label="Notes" value={svc.notes} />}
                      </div>

                      {/* Assignment */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 mt-1">
                          Assignment
                        </p>
                        {svc.equipment && (
                          <>
                            <InfoRow label="Equipment" value={svc.equipment.name} />
                            <InfoRow label="Equip. Code" value={svc.equipment.code} />
                            <InfoRow
                              label="Equip. Status"
                              value={
                                <span
                                  className={`capitalize px-2 py-0.5 rounded-full text-xs border ${
                                    svc.equipment.status === "active"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {svc.equipment.status}
                                </span>
                              }
                            />
                          </>
                        )}
                        {svc.practitioner && (
                          <InfoRow
                            label="Clinician"
                            value={
                              <span className="flex items-center gap-1">
                                <MdPersonPin className="w-3.5 h-3.5 text-slate-400" />
                                {svc.practitioner.name}
                              </span>
                            }
                          />
                        )}
                      </div>

                      {/* Payment */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 mt-1">
                          Payment
                        </p>
                        <InfoRow label="Tariff" value={formatCurrency(svc.tariff)} />
                        <InfoRow label="SHA" value={formatCurrency(svcPayment?.sha)} />
                        <InfoRow label="Cash" value={formatCurrency(svcPayment?.cash)} />
                        <InfoRow label="Other Insur." value={formatCurrency(svcPayment?.other_insurance)} />
                        {svc.revenue && (
                          <>
                            <InfoRow label="Vendor Share" value={formatCurrency(svc.revenue.vendor_share)} />
                            <InfoRow label="Facility Share" value={formatCurrency(svc.revenue.facility_share)} />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Result block */}
                    {svc.result && (
                      <div className="mx-4 mb-4 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-200">
                          <MdRadio className="w-4 h-4 text-slate-400" />
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Result
                          </p>
                          {svc.result.result_status && (
                            <span
                              className={`ml-auto inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                                RESULT_STATUS_BADGE[svc.result.result_status] ??
                                "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {svc.result.result_status}
                            </span>
                          )}
                          {svc.result.worklist_status && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                              Worklist: {svc.result.worklist_status}
                            </span>
                          )}
                        </div>
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                          <InfoRow label="Accession No." value={svc.result.accession_number} />
                          <InfoRow label="Modality" value={svc.result.modality} />
                          <InfoRow label="Study" value={svc.result.study_description} />
                          <InfoRow
                            label="Critical Values"
                            value={
                              svc.result.has_critical_values ? (
                                <span className="text-red-600 font-semibold">Yes</span>
                              ) : (
                                <span className="text-slate-400">No</span>
                              )
                            }
                          />
                          {svc.result.performing_technologist && (
                            <InfoRow label="Technologist" value={svc.result.performing_technologist} />
                          )}
                          {svc.result.interpreting_physician && (
                            <InfoRow label="Physician" value={svc.result.interpreting_physician} />
                          )}
                          {svc.result.received_at && (
                            <InfoRow label="Received At" value={formatDate(svc.result.received_at)} />
                          )}
                          {svc.result.observations && (
                            <div className="col-span-2 py-1.5">
                              <span className="text-xs text-slate-400 block mb-1">Observations</span>
                              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                {svc.result.observations}
                              </p>
                            </div>
                          )}
                          {svc.result.result_body && (
                            <div className="col-span-2 py-1.5">
                              <span className="text-xs text-slate-400 block mb-1">Result Body</span>
                              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                {svc.result.result_body}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Audit footer */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <MdInfo className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Audit</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <InfoRow label="Created By" value={createdByName} />
            <InfoRow label="Created At" value={formatDate(booking.created_at)} />
            {booking.updated_at && (
              <InfoRow label="Last Updated" value={formatDate(booking.updated_at)} />
            )}
            {booking.finance_approved_at && (
              <InfoRow
                label="Finance Approved"
                value={
                  <span className="text-emerald-600">{formatDate(booking.finance_approved_at)}</span>
                }
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
