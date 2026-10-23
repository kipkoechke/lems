"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMemo, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import { Table } from "@/components/Table";
import { useVendorBookingsPaginated } from "@/features/vendors/useVendorBookings";
import type { VendorBookingItem } from "@/types/booking";
import { kes, titleCase } from "@/lib/format";
import {
  VendorServiceStatus,
  isAwaitingDelivery,
  isDelivered,
  serviceDate,
  shareOf,
} from "@/features/vendors/vendorServiceStatus";

const PAGE_SIZE = 15;

/**
 * The vendor's share of each service booked on their machines.
 *
 * The totals split the share by whether the service was delivered: a share on
 * a service not yet delivered is work promised, not earned. The page used to
 * count every booked service as "Services delivered" (3, with none delivered)
 * and showed a tariff total that read KES 0 on every deployment. Tariff now
 * appears only when the API actually sends one.
 *
 * There is no vendor invoice or payout endpoint, so nothing here claims a
 * payment was made.
 */
function VendorPayments() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  // Every service in one request, so the totals cover all of them rather than
  // the page on screen. A vendor has tens of bookings; past 100 the totals
  // say they are partial.
  const { bookings, pagination, isLoading, error, refetch } =
    useVendorBookingsPaginated({
      per_page: 100,
      search: submittedTerm || undefined,
    });

  const items: VendorBookingItem[] = useMemo(
    () =>
      [...bookings].sort((a, b) =>
        b.booking.created_at.localeCompare(a.booking.created_at),
      ),
    [bookings],
  );
  const delivered = items.filter(isDelivered);
  const awaiting = items.filter(isAwaitingDelivery);
  const partial = (pagination?.total ?? 0) > items.length;
  const showTariff = items.some((item) => Number(item.tariff_amount) > 0);

  const lastPage = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) {
    return (
      <ErrorState
        title="Unable to load payments"
        error={error}
        action={{ label: "Try again", onClick: () => refetch() }}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 mb-2 md:mb-3">
        <Tile
          label="Earned"
          value={kes(shareOf(delivered))}
          note={`${delivered.length} ${delivered.length === 1 ? "service" : "services"} delivered`}
          tone="text-emerald-700"
          loading={isLoading}
        />
        <Tile
          label="Waiting on delivery"
          value={kes(shareOf(awaiting))}
          note={`${awaiting.length} ${awaiting.length === 1 ? "service" : "services"} not yet delivered`}
          tone="text-amber-700"
          loading={isLoading}
        />
        <Tile
          label="Total share booked"
          value={kes(shareOf(items))}
          note={`${items.length} ${items.length === 1 ? "service" : "services"}${partial ? " (latest 100)" : ""}`}
          tone="text-slate-900"
          loading={isLoading}
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-3 md:p-4 border-b border-slate-100">
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

        <div className="hidden md:block">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Service</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                {showTariff && (
                  <Table.HeaderCell align="right">Tariff</Table.HeaderCell>
                )}
                <Table.HeaderCell align="right">Your share</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Loading colSpan={showTariff ? 6 : 5} rows={5} />
              ) : visible.length === 0 ? (
                <Table.Empty colSpan={showTariff ? 6 : 5}>
                  {submittedTerm
                    ? "No services match your search"
                    : "No services have been booked on your machines yet"}
                </Table.Empty>
              ) : (
                visible.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <span className="text-sm text-slate-700 whitespace-nowrap">
                        {serviceDate(item.booking?.created_at)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">
                        {item.service?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-mono">
                          {item.booking?.booking_number}
                        </span>{" "}
                        · {item.patient?.name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {titleCase(item.facility?.name ?? "—")}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <VendorServiceStatus status={item.status} />
                    </Table.Cell>
                    {showTariff && (
                      <Table.Cell align="right">
                        <span className="text-sm text-slate-700 tabular-nums">
                          {kes(item.tariff_amount)}
                        </span>
                      </Table.Cell>
                    )}
                    <Table.Cell align="right">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {kes(item.vendor_share)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4 space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded bg-slate-100" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              {submittedTerm
                ? "No services match your search"
                : "No services have been booked on your machines yet"}
            </p>
          ) : (
            visible.map((item) => (
              <div key={item.id} className="p-4 space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">
                    {item.service?.name || "—"}
                  </p>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {kes(item.vendor_share)}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {titleCase(item.facility?.name ?? "—")}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    {serviceDate(item.booking?.created_at)} ·{" "}
                    <span className="font-mono">
                      {item.booking?.booking_number}
                    </span>
                  </span>
                  <VendorServiceStatus status={item.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {lastPage > 1 && (
          <Pagination
            currentPage={page}
            lastPage={lastPage}
            total={items.length}
            perPage={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}

function Tile({
  label,
  value,
  note,
  tone,
  loading,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      {loading ? (
        <div className="mt-1 h-7 w-28 rounded bg-slate-100 animate-pulse" />
      ) : (
        <>
          <p className={`mt-0.5 text-2xl font-bold tabular-nums ${tone}`}>
            {value}
          </p>
          <p className="text-xs text-slate-500">{note}</p>
        </>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_PAYMENTS}>
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 mb-2 md:mb-3 px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Payments</h1>
                <p className="text-sm text-slate-500">
                  Your share of each service booked on your machines
                </p>
              </div>
            </div>
          </div>

          <VendorPayments />
        </div>
      </div>
    </PermissionGate>
  );
}
