"use client";

import { useState } from "react";
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

const CLAIM_STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Payment-completed": "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  "clinical-review": "bg-purple-50 text-purple-700 border-purple-200",
};

const formatDate = (
  dateString: string | undefined | null,
  dateOnly = false,
) => {
  if (!dateString) return "-";
  const opts: Intl.DateTimeFormatOptions = dateOnly
    ? { day: "numeric", month: "short", year: "numeric" }
    : {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
  return new Date(dateString).toLocaleDateString("en-GB", opts);
};

const formatCurrency = (value: string | number | undefined | null) => {
  const num = Number(value ?? 0);
  return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-xs text-slate-400 w-36 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-900 font-medium flex-1">
        {value || "-"}
      </span>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
      <span className="text-slate-400">{icon}</span>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {title}
      </p>
    </div>
  );
}

// ===== Collapsible Service Card Component =====
function ServiceList({ services }: { services: BookingService[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <SectionHeader
        icon={<MdMedicalServices className="w-4 h-4" />}
        title={`Services (${services.length})`}
      />

      {/* Column headers */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100 mb-1">
        <span className="col-span-3">Service</span>
        <span className="col-span-2">Schedule</span>
        <span className="col-span-2">Equipment</span>
        <span className="col-span-2">Clinician</span>
        <span className="col-span-2 text-right">Payment</span>
        <span className="col-span-1 text-center">Status</span>
      </div>

      <div className="space-y-1">
        {services.map((svc, idx) => {
          const key = svc.id ?? String(idx);
          const isOpen = expanded.has(key);
          const serviceName = svc.service?.name ?? svc.name ?? "-";
          const serviceCode = svc.service?.code ?? svc.code ?? "";
          const svcPayment = svc.payment as
            | { cash?: string; sha?: string; other_insurance?: string }
            | undefined;

          return (
            <div
              key={key}
              className="rounded-lg border border-slate-100 overflow-hidden"
            >
              {/* Summary row — always visible, click to expand */}
              <button
                onClick={() => toggle(key)}
                className="w-full text-left grid grid-cols-12 gap-2 px-3 py-2.5 items-center hover:bg-slate-50 transition-colors"
              >
                <div className="col-span-3 min-w-0 flex items-center gap-1.5">
                  {svc.lot && (
                    <span className="shrink-0 text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {svc.lot.number}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {serviceName}
                  </span>
                  {serviceCode && (
                    <span className="shrink-0 font-mono text-[9px] bg-blue-50 text-blue-600 px-1 rounded hidden sm:inline">
                      {serviceCode}
                    </span>
                  )}
                </div>
                <span className="col-span-2 text-xs text-slate-500 truncate">
                  {svc.scheduled_date
                    ? formatDate(svc.scheduled_date, true)
                    : "-"}
                </span>
                <span className="col-span-2 text-xs text-slate-500 truncate">
                  {svc.equipment?.name || "-"}
                </span>
                <span className="col-span-2 text-xs text-slate-500 truncate">
                  {svc.practitioner?.name || "-"}
                </span>
                <span className="col-span-2 text-xs text-slate-700 text-right font-medium">
                  {formatCurrency(svc.tariff)}
                </span>
                <span className="col-span-1 text-center">
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      SERVICE_STATUS_BADGE[svc.status] ??
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {SERVICE_STATUS_LABEL[svc.status] ?? svc.status}
                  </span>
                </span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Scheduling */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Scheduling
                      </p>
                      <InfoRow
                        label="Scheduled"
                        value={
                          svc.scheduled_date
                            ? formatDate(svc.scheduled_date, true)
                            : "-"
                        }
                      />
                      <InfoRow label="Started" value={formatDate(svc.started_at)} />
                      <InfoRow label="Completed" value={formatDate(svc.completed_at)} />
                      {svc.cancel_reason && (
                        <InfoRow label="Cancel" value={svc.cancel_reason} />
                      )}
                      {svc.notes && <InfoRow label="Notes" value={svc.notes} />}
                    </div>

                    {/* Assignment */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Assignment
                      </p>
                      {svc.equipment ? (
                        <>
                          <InfoRow label="Equipment" value={svc.equipment.name} />
                          <InfoRow label="Code" value={svc.equipment.code} />
                          <InfoRow
                            label="Status"
                            value={
                              <span
                                className={`capitalize px-1.5 py-0.5 rounded-full text-[10px] border ${
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
                      ) : (
                        <p className="text-xs text-slate-400 py-1">Not assigned</p>
                      )}
                      {svc.practitioner && (
                        <InfoRow
                          label="Clinician"
                          value={
                            <span className="flex items-center gap-1">
                              <MdPersonPin className="w-3 h-3 text-slate-400" />
                              {svc.practitioner.name}
                            </span>
                          }
                        />
                      )}
                    </div>

                    {/* Payment */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Payment
                      </p>
                      <InfoRow label="Tariff" value={formatCurrency(svc.tariff)} />
                      <InfoRow label="SHA" value={formatCurrency(svcPayment?.sha)} />
                      <InfoRow label="Cash" value={formatCurrency(svcPayment?.cash)} />
                      <InfoRow label="Other" value={formatCurrency(svcPayment?.other_insurance)} />
                      {svc.revenue && (
                        <>
                          <InfoRow label="Vendor" value={formatCurrency(svc.revenue.vendor_share)} />
                          <InfoRow label="Facility" value={formatCurrency(svc.revenue.facility_share)} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Result block — collapsible within expanded view */}
                  {svc.result && (
                    <ResultBlock result={svc.result} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Collapsible Result Block =====
function ResultBlock({ result }: { result: NonNullable<BookingService["result"]> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-3 mb-3 rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <MdRadio className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Result
        </span>
        {result.result_status && (
          <span
            className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
              RESULT_STATUS_BADGE[result.result_status] ??
              "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            {result.result_status}
          </span>
        )}
        {result.worklist_status && (
          <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium border bg-blue-50 text-blue-700 border-blue-200">
            {result.worklist_status}
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-400">
          {open ? "▲ Hide" : "▼ Show"}
        </span>
      </button>
      {open && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 border-t border-slate-100">
          <InfoRow label="Accession No." value={result.accession_number} />
          <InfoRow label="Modality" value={result.modality} />
          <InfoRow label="Study" value={result.study_description} />
          <InfoRow
            label="Critical Values"
            value={
              result.has_critical_values ? (
                <span className="text-red-600 font-semibold">Yes</span>
              ) : (
                <span className="text-slate-400">No</span>
              )
            }
          />
          {result.performing_technologist && (
            <InfoRow label="Technologist" value={result.performing_technologist} />
          )}
          {result.interpreting_physician && (
            <InfoRow label="Physician" value={result.interpreting_physician} />
          )}
          {result.received_at && (
            <InfoRow label="Received" value={formatDate(result.received_at)} />
          )}
          {result.observations && (
            <div className="col-span-2 py-1.5">
              <span className="text-xs text-slate-400 block mb-1">Observations</span>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {result.observations}
              </p>
            </div>
          )}
          {result.result_body && (
            <div className="col-span-2 py-1.5">
              <span className="text-xs text-slate-400 block mb-1">Result Body</span>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">
                {result.result_body}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-9 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-lg border border-slate-200"
              />
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

  const services: BookingService[] =
    booking.services || booking.booked_services || [];
  const payment = booking.payment;
  const completedCount = services.filter(
    (s) => s.status === "completed",
  ).length;
  const pendingCount = services.filter(
    (s) => s.status === "not_started" || s.status === "in_progress",
  ).length;
  const totalTariff = services.reduce(
    (sum, s) => sum + Number(s.tariff ?? 0),
    0,
  );
  const createdByName =
    typeof booking.created_by === "object" && booking.created_by !== null
      ? booking.created_by.name
      : (booking.created_by ?? "-");

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {booking.booking_number}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  STATUS_BADGE[booking.status] ??
                  "bg-slate-50 text-slate-700 border-slate-200"
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
              {booking.sha_status && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    CLAIM_STATUS_BADGE[booking.sha_status] ??
                    "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  SHA: {booking.sha_status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created {formatDate(booking.created_at)} &middot; Source:{" "}
              <span className="capitalize">
                {booking.source?.replace(/_/g, " ") ?? "-"}
              </span>{" "}
              &middot; By: {createdByName}
            </p>
          </div>
        </div>

        {/* Stats + Payment combined row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
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
              icon: <MdAttachMoney className="w-4 h-4 text-blue-700" />,
              bg: "bg-blue-50",
              label: "SHA",
              value: formatCurrency(payment?.sha ?? booking.sha),
            },
            {
              icon: <MdAttachMoney className="w-4 h-4 text-emerald-700" />,
              bg: "bg-emerald-50",
              label: "Cash",
              value: formatCurrency(payment?.cash ?? booking.cash),
            },
            {
              icon: <MdAttachMoney className="w-4 h-4 text-purple-700" />,
              bg: "bg-purple-50",
              label: "Other Insurance",
              value: formatCurrency(payment?.other_insurance ?? booking.other_insurance),
            },
            {
              icon: <MdAttachMoney className="w-4 h-4 text-slate-700" />,
              bg: "bg-slate-100",
              label: "Total Tariff",
              value: formatCurrency(payment?.tariff ?? totalTariff),
            },
          ].map(({ icon, bg, label, value }) => (
            <div
              key={label}
              className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2"
            >
              <div
                className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center shrink-0`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Patient + Facility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <SectionHeader
              icon={<MdPerson className="w-4 h-4" />}
              title="Patient"
            />
            <InfoRow label="Full Name" value={booking.patient?.name} />
            {booking.patient?.date_of_birth && (
              <InfoRow
                label="Age"
                value={`${Math.floor(
                  (Date.now() - new Date(booking.patient.date_of_birth).getTime()) /
                    31557600000,
                )} years`}
              />
            )}
            {booking.patient?.gender && (
              <InfoRow
                label="Gender"
                value={
                  <span className="capitalize">{booking.patient.gender}</span>
                }
              />
            )}
            {booking.patient?.sha_number && (
              <InfoRow label="SHA Number" value={booking.patient.sha_number} />
            )}
          </div>

          {/* Facility */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <SectionHeader
              icon={<MdLocalHospital className="w-4 h-4" />}
              title="Facility"
            />
            <InfoRow label="Name" value={booking.facility?.name} />
            <InfoRow label="FR Code" value={booking.facility?.fr_code} />
            <InfoRow
              label="Source"
              value={
                <span className="capitalize">
                  {booking.source?.replace(/_/g, " ")}
                </span>
              }
            />
            {booking.notes && <InfoRow label="Notes" value={booking.notes} />}
            <InfoRow
              label="Finance Approved"
              value={
                booking.finance_approved_at ? (
                  <span className="text-emerald-600">
                    {formatDate(booking.finance_approved_at)}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">Not approved</span>
                )
              }
            />
            {booking.sha_status && (
              <InfoRow
                label="SHA Claim Status"
                value={
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      CLAIM_STATUS_BADGE[booking.sha_status] ??
                      "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {booking.sha_status}
                  </span>
                }
              />
            )}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <ServiceList services={services} />
        )}

        {/* Audit footer */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <MdInfo className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Audit
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <InfoRow label="Created By" value={createdByName} />
            <InfoRow
              label="Created At"
              value={formatDate(booking.created_at)}
            />
            {booking.updated_at && (
              <InfoRow
                label="Last Updated"
                value={formatDate(booking.updated_at)}
              />
            )}
            {booking.finance_approved_at && (
              <InfoRow
                label="Finance Approved"
                value={
                  <span className="text-emerald-600">
                    {formatDate(booking.finance_approved_at)}
                  </span>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
