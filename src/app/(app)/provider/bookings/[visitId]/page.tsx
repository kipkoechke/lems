"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useAssignProviderClaim,
  useProviderBooking,
  useProviderBookingCosts,
} from "@/features/provider/useProvider";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";
import { FaArrowLeft, FaTag, FaTimes } from "react-icons/fa";

const formatCurrency = (value?: number | null) =>
  value === undefined || value === null
    ? "-"
    : `KES ${Number(value).toLocaleString()}`;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function ProviderBookingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const visitId = params.visitId as string;

  const [showClaim, setShowClaim] = useState(false);
  const [claimId, setClaimId] = useState("");

  const { booking, isLoading, error, refetch } = useProviderBooking(visitId);
  const { costs } = useProviderBookingCosts(visitId);
  const { assignClaim, isAssigning } = useAssignProviderClaim();

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <ErrorState
        title="Unable to Load Booking"
        error={error}
        message={!error && !booking ? "Booking not found" : undefined}
        action={{
          label: "Back to Bookings",
          onClick: () => router.push("/provider/bookings"),
        }}
        fullScreen
      />
    );
  }

  // Prefer the costs endpoint's service lines — they carry the share breakdown.
  const services = costs?.services ?? booking.services ?? [];

  const details = [
    { label: "Booking Number", value: booking.booking_number },
    { label: "Visit ID", value: booking.visit_id },
    { label: "Claim ID", value: booking.claim_id },
    { label: "Patient", value: booking.patient?.name },
    { label: "CR No", value: booking.patient?.cr_no ?? costs?.patient?.cr_no },
    { label: "Facility", value: booking.facility?.name },
    { label: "FR Code", value: booking.facility?.fr_code },
    { label: "Created", value: formatDate(booking.created_at) },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {booking.booking_number}
            </h1>
            <p className="text-sm text-slate-500">
              {booking.patient?.name || "-"}
            </p>
          </div>
          <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
            {booking.status?.replace(/_/g, " ") || "-"}
          </span>
          <button
            onClick={() => {
              setClaimId(booking.claim_id ?? "");
              setShowClaim(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaTag className="w-3.5 h-3.5" />
            {booking.claim_id ? "Update Claim ID" : "Assign Claim ID"}
          </button>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="text-sm font-medium text-slate-900 break-words">
                  {d.value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Services + cost breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Services & Cost Breakdown ({services.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Service</Table.HeaderCell>
                  <Table.HeaderCell>Equipment</Table.HeaderCell>
                  <Table.HeaderCell>Tariff</Table.HeaderCell>
                  <Table.HeaderCell>Split</Table.HeaderCell>
                  <Table.HeaderCell>Vendor</Table.HeaderCell>
                  <Table.HeaderCell>Facility</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {services.length === 0 ? (
                  <Table.Empty colSpan={7}>
                    No services on this booking.
                  </Table.Empty>
                ) : (
                  services.map((s, i) => {
                    // Vendor/facility totals combine the cash and SHA legs.
                    const vendorTotal =
                      (s.breakdown?.cash?.vendor ?? 0) +
                      (s.breakdown?.sha?.vendor ?? 0);
                    const facilityTotal =
                      (s.breakdown?.cash?.facility ?? 0) +
                      (s.breakdown?.sha?.facility ?? 0);

                    return (
                      <Table.Row key={s.id ?? i}>
                        <Table.Cell>
                          <div className="font-medium text-slate-900">
                            {s.name || "-"}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {s.code}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-slate-700">
                            {s.equipment?.name || "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-slate-900">
                            {formatCurrency(s.shareDistribution?.tariff)}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-xs text-slate-600 font-mono">
                            {s.shareDistribution
                              ? `${s.shareDistribution.vendorPercentage}/${s.shareDistribution.facilityPercentage}`
                              : "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm font-medium text-slate-900">
                            {vendorTotal ? formatCurrency(vendorTotal) : "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm font-medium text-slate-900">
                            {facilityTotal ? formatCurrency(facilityTotal) : "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                            {s.status?.replace(/_/g, " ") || "-"}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>

      {/* Claim modal */}
      {showClaim && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Assign Claim ID
              </h3>
              <button
                onClick={() => setShowClaim(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Claim ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="Enter the SHA claim ID"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setShowClaim(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  assignClaim(
                    { visitId, claimId: claimId.trim() },
                    {
                      onSuccess: () => {
                        setShowClaim(false);
                        refetch();
                      },
                    },
                  )
                }
                disabled={!claimId.trim() || isAssigning}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProviderBookingDetailPage() {
  return (
    <PermissionGate permission={Permission.VIEW_PROVIDER_BOOKINGS}>
      <ProviderBookingDetailContent />
    </PermissionGate>
  );
}
