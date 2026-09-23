"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useState } from "react";
import {
  FaMoneyBillWave,
  FaLayerGroup,
  FaHandHoldingUsd,
} from "react-icons/fa";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import { Table } from "@/components/Table";
import { useVendorDashboard } from "@/features/vendors/useVendorDashboard";
import { useVendorBookingsPaginated } from "@/features/vendors/useVendorBookings";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import type { VendorBookingItem } from "@/types/booking";

const formatCurrency = (amount: string | number | null | undefined) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

interface SummaryTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "green" | "blue" | "purple";
}

const TONES = {
  green: "bg-green-50 border-green-200 text-green-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

function SummaryTile({ label, value, icon, tone }: SummaryTileProps) {
  return (
    <div className={`rounded-lg p-4 border ${TONES[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold truncate">{value}</p>
        </div>
        <div className="opacity-40 shrink-0">{icon}</div>
      </div>
    </div>
  );
}

/**
 * Vendor view — earnings per booked service from /vendor/bookings, with the
 * totals from /vendor/dashboard. There is no vendor invoice endpoint, so no
 * invoice/arrears figures are shown.
 */
function VendorPayments() {
  const { vendorId } = useMyVendor();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { data: dashboard } = useVendorDashboard(vendorId);
  const { bookings, summary, pagination, isLoading, error } =
    useVendorBookingsPaginated({
      page,
      per_page: 15,
      search: submittedTerm || undefined,
    });

  const items: VendorBookingItem[] = bookings;
  const revenue = dashboard?.revenue;

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Payments"
        error={error}
        action={{ label: "Try Again", onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryTile
          tone="green"
          label="Your Share"
          value={formatCurrency(revenue?.vendor_share)}
          icon={<FaHandHoldingUsd className="w-10 h-10" />}
        />
        <SummaryTile
          tone="blue"
          label="Total Tariff Billed"
          value={formatCurrency(revenue?.total_tariff)}
          icon={<FaMoneyBillWave className="w-10 h-10" />}
        />
        <SummaryTile
          tone="purple"
          label="Services Delivered"
          value={(summary?.total ?? 0).toLocaleString()}
          icon={<FaLayerGroup className="w-10 h-10" />}
        />
      </div>

      <div className="mb-6">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={() => {
            setSubmittedTerm(searchTerm);
            setPage(1);
          }}
          onClear={() => {
            setSearchTerm("");
            setSubmittedTerm("");
            setPage(1);
          }}
          placeholder="Search by booking number or patient..."
        />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Booking #</Table.HeaderCell>
                <Table.HeaderCell>Service</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Tariff</Table.HeaderCell>
                <Table.HeaderCell>Your Share</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Loading colSpan={6} rows={5} />
              ) : items.length === 0 ? (
                <Table.Empty colSpan={6}>
                  <div className="flex flex-col items-center gap-2">
                    <FaMoneyBillWave className="w-8 h-8 text-slate-200" />
                    <span className="text-sm text-slate-500">
                      No earnings recorded yet
                    </span>
                  </div>
                </Table.Empty>
              ) : (
                items.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {item.booking?.booking_number || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">
                        {item.service?.name || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.patient?.name || "-"}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{item.facility?.name || "-"}</Table.Cell>
                    <Table.Cell>{formatCurrency(item.tariff_amount)}</Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.vendor_share)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {formatDate(item.booking?.created_at)}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.total_pages}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}

export default function PaymentsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_PAYMENTS}>
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Revenue & Payments
                  </h1>
                  <p className="text-sm md:text-base text-green-100">
                    Your share of every service delivered on your equipment
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8">
              <VendorPayments />
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
