"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCurrentFacility } from "@/hooks/useAuth";
import {
  useBookingsExport,
  useBookingsWithPagination,
} from "@/features/services/bookings/useBookings";
import { useSearchControl } from "@/hooks/useSearchControl";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import { FacilityFilter } from "@/components/common/FacilityFilter";
import { KephLevelFilter } from "@/components/common/KephLevelFilter";
import { LotServiceFilter } from "@/components/common/LotServiceFilter";
import {
  MODALITY_OPTIONS,
  SHA_CLAIM_FILTER_OPTIONS,
} from "@/lib/selectOptions";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ShaClaimChip } from "@/components/common/ShaClaimBadges";
import {
  DELIVERY_BADGES,
  DELIVERY_LABELS,
  deliveryProgress,
  deliveryState,
  serviceNames,
} from "@/lib/bookingStatus";
import {
  MdCalendarToday,
  MdCheckCircle,
  MdPending,
  MdAttachMoney,
  MdPeople,
  MdList,
  MdLocalHospital,
  MdTune,
  MdFileDownload,
  MdClose,
} from "react-icons/md";
import type { Booking, BookingFilters } from "@/types/booking";

/**
 * What the status filter offers.
 *
 * These are the API's own lifecycle values, which is what `?status=` accepts.
 * The badge on each row reports delivery instead — see `deliveryState` — so a
 * row can read "Not started" while the booking it belongs to is `active`.
 */
const STATUS_FILTER_OPTIONS = [
  { value: "active", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending_otp", label: "Pending OTP" },
];

export default function ServicesPage() {
  const router = useRouter();
  const facility = useCurrentFacility();

  const [page, setPage] = useState(1);
  // Facility users are locked to their own facility; everyone else picks one.
  const [facilityId, setFacilityId] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [kephLevel, setKephLevel] = useState("");
  const [modality, setModality] = useState("");
  const [lotId, setLotId] = useState("");
  const [lotServiceId, setLotServiceId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // The two SHA claim facts behind one control: "", "verified", "submitted"
  // or "unsent". "" is no filter, which is not the same as `false`.
  const [shaClaim, setShaClaim] = useState("");
  // Everything past search and status lives behind this, so the bar is one row.
  const [showFilters, setShowFilters] = useState(false);
  const search = useSearchControl(() => setPage(1));

  const filters: BookingFilters = useMemo(
    () => ({
      facility_id: facility?.id || facilityId || undefined,
      // Searching is unpaginated so results span all bookings rather than
      // being capped at one page of matches.
      ...(search.isSearching ? {} : { page, per_page: 15 }),
      search: search.term || undefined,
      status: status || undefined,
      source: source || undefined,
      keph_level: kephLevel || undefined,
      modality: modality || undefined,
      lot_id: lotId || undefined,
      lot_service_id: lotServiceId || undefined,
      from: from || undefined,
      to: to || undefined,
      // "verified" needs no `sha_submitted`: a verified claim was sent.
      sha_submitted:
        shaClaim === "submitted" ? true : shaClaim === "unsent" ? false : undefined,
      sha_verified: shaClaim === "verified" ? true : undefined,
      sort_by: "created_at",
      sort_order: "desc",
    }),
    [
      facility?.id,
      facilityId,
      page,
      search.term,
      search.isSearching,
      status,
      source,
      kephLevel,
      modality,
      lotId,
      lotServiceId,
      from,
      to,
      shaClaim,
    ],
  );

  const { data, isLoading, error } = useBookingsWithPagination(filters);
  // The export covers everything these filters select, not the page on screen.
  const { download, isExporting } = useBookingsExport(filters);

  // Only the controls hidden behind the panel count, so the badge tells the
  // user what they cannot currently see. Search and status are always visible.
  const hiddenFilters = [
    facility?.id ? "" : facilityId,
    modality,
    lotId,
    lotServiceId,
    kephLevel,
    source,
    shaClaim,
    from,
    to,
  ];
  const activeFilterCount = hiddenFilters.filter(Boolean).length;

  const clearFilters = () => {
    if (!facility?.id) setFacilityId("");
    setModality("");
    setLotId("");
    setLotServiceId("");
    setKephLevel("");
    setSource("");
    setShaClaim("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const bookings: Booking[] = data?.data || [];
  const pagination = data?.pagination;
  const summary = data?.summary;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded" />
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Bookings"
        error={error}
        action={{ label: "Try Again", onClick: () => window.location.reload() }}
        fullScreen
      />
    );
  }

  return (
    <PermissionGate permission={Permission.VIEW_SERVICES}>
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Services</h1>
              <p className="text-sm text-slate-500">
                {pagination?.total ?? 0} bookings
              </p>
            </div>
          </div>

          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                  <MdPeople className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Total Bookings</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.total_bookings.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                  <MdCheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Completed</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.by_status.completed.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                  <MdPending className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Open</p>
                  <p className="text-sm font-medium text-slate-900">
                    {summary.by_status.active.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center shrink-0">
                  <MdAttachMoney className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Revenue (SHA)</p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {Number(summary.revenue.sha).toLocaleString("en-KE", {
                      style: "currency",
                      currency: "KES",
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters

              Nine controls used to sit in one wrapping row, which is what
              pushed the page wider than the screen. Search and status stay
              out — they are what people reach for — and the rest fold into
              a panel that reports how many of them are set, so a narrowed
              list never looks like an empty one. */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <SearchField
                  value={search.input}
                  onChange={search.onInputChange}
                  onSearch={search.submit}
                  onClear={search.clear}
                  placeholder="Search booking number, patient, ID..."
                />
              </div>
              <div className="flex items-center gap-2">
                <SearchableSelect
                  label=""
                  compact
                  className="flex-1 sm:w-[150px]"
                  value={status}
                  onChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                  placeholder="All statuses"
                  options={STATUS_FILTER_OPTIONS}
                />
                <button
                  type="button"
                  onClick={() => setShowFilters((open) => !open)}
                  aria-expanded={showFilters}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    showFilters || activeFilterCount
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <MdTune className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={isExporting}
                  title="Download every booking these filters select — facility, patient, services, status, whether results came back, whether the worklist was queried, and the SHA claim"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <MdFileDownload className="w-4 h-4" />
                  {isExporting ? "Preparing..." : "Export"}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Facility — hidden for facility-scoped users, who only
                      ever see their own bookings anyway */}
                  {!facility?.id && (
                    <FacilityFilter
                      hideLabel
                      value={facilityId}
                      onChange={(id) => {
                        setFacilityId(id);
                        setPage(1);
                      }}
                    />
                  )}
                  <SearchableSelect
                    label=""
                    compact
                    value={modality}
                    onChange={(value) => {
                      setModality(value);
                      setPage(1);
                    }}
                    placeholder="All modalities"
                    searchPlaceholder="Search modalities..."
                    options={MODALITY_OPTIONS}
                  />
                  <LotServiceFilter
                    lotId={lotId}
                    onLotChange={(value) => {
                      setLotId(value);
                      setPage(1);
                    }}
                    serviceId={lotServiceId}
                    onServiceChange={(value) => {
                      setLotServiceId(value);
                      setPage(1);
                    }}
                  />
                  <KephLevelFilter
                    value={kephLevel}
                    onChange={(value) => {
                      setKephLevel(value);
                      setPage(1);
                    }}
                  />
                  <SearchableSelect
                    label=""
                    compact
                    value={source}
                    onChange={(value) => {
                      setSource(value);
                      setPage(1);
                    }}
                    placeholder="All sources"
                    options={[
                      { value: "standalone", label: "Standalone" },
                      { value: "hmis", label: "HMIS" },
                      { value: "provider_portal", label: "Provider Portal" },
                    ]}
                  />
                  {/* Both SHA claim facts in one control — verified implies
                      submitted, and "not sent" is the negation of it. */}
                  <SearchableSelect
                    label=""
                    compact
                    value={shaClaim}
                    onChange={(value) => {
                      setShaClaim(value);
                      setPage(1);
                    }}
                    placeholder="Any SHA state"
                    options={SHA_CLAIM_FILTER_OPTIONS}
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setPage(1);
                      }}
                      className="w-full min-w-0 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      title="From date"
                    />
                    <span className="text-xs text-slate-400 shrink-0">to</span>
                    <input
                      type="date"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setPage(1);
                      }}
                      className="w-full min-w-0 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      title="To date"
                    />
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    <MdClose className="w-3.5 h-3.5" />
                    Clear {activeFilterCount} filter
                    {activeFilterCount === 1 ? "" : "s"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table

              Seven columns became five. Source moved into the booking cell —
              it is an attribute of the booking, not a thing to scan down —
              and the actions column went with it, since its only item was
              "View" and the row now opens the booking. The cells drop the
              shared `px-6` and the facility is allowed to wrap, which is what
              the horizontal scrollbar was actually made of. */}
          <div className="bg-white rounded-lg border border-slate-200 hidden md:block overflow-hidden">
            <Table className="w-full table-fixed">
              <Table.Header>
                <Table.Row hover={false}>
                  <Table.HeaderCell className="px-3 w-[26%]">
                    Booking
                  </Table.HeaderCell>
                  <Table.HeaderCell className="px-3 w-[20%]">
                    Patient
                  </Table.HeaderCell>
                  <Table.HeaderCell className="px-3 w-[24%]">
                    Facility
                  </Table.HeaderCell>
                  <Table.HeaderCell className="px-3 w-[18%]">
                    Status
                  </Table.HeaderCell>
                  <Table.HeaderCell className="px-3 w-[12%]">
                    Date
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {bookings.length === 0 ? (
                  <Table.Empty colSpan={5}>No bookings found</Table.Empty>
                ) : (
                  bookings.map((booking: Booking) => {
                    // The service belongs with the booking it was made for,
                    // not in a column of its own — a count there said how
                    // many without saying which.
                    const services = serviceNames(booking);
                    const state = deliveryState(booking);
                    const progress = deliveryProgress(booking);

                    return (
                      <Table.Row
                        key={booking.id}
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                      >
                        <Table.Cell className="px-3 whitespace-normal align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                              {booking.booking_number}
                            </span>
                            {booking.source && (
                              <span className="capitalize text-[11px] text-slate-500 truncate">
                                {booking.source.replace("_", " ")}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                            {services.length ? (
                              <>
                                {services[0]}
                                {services.length > 1 && (
                                  <span className="text-slate-400">
                                    {" "}
                                    +{services.length - 1} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-400">
                                {booking.services_count ?? 0} service
                                {(booking.services_count ?? 0) === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-3 whitespace-normal align-top">
                          <div className="font-medium text-slate-900 text-sm line-clamp-2">
                            {booking.patient?.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {booking.patient?.identification_no}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-3 whitespace-normal align-top">
                          <div className="text-sm text-slate-900 line-clamp-2">
                            {booking.facility?.name ?? "—"}
                          </div>
                          {booking.facility?.fr_code && (
                            <div className="font-mono text-[11px] text-slate-400">
                              {booking.facility.fr_code}
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-3 whitespace-normal align-top">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${DELIVERY_BADGES[state]}`}
                            >
                              {DELIVERY_LABELS[state]}
                            </span>
                            {progress && (
                              <span
                                className="text-[11px] text-slate-400"
                                title="Services delivered on this booking"
                              >
                                {progress}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5">
                            <ShaClaimChip booking={booking} />
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-3 align-top">
                          <span className="text-xs text-slate-500">
                            {new Date(booking.created_at).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
            {!search.isSearching && pagination && pagination.last_page > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                onPageChange={setPage}
              />
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
                No bookings found
              </div>
            ) : (
              bookings.map((booking: Booking) => {
                const services = serviceNames(booking);

                return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 cursor-pointer"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {booking.booking_number}
                      </span>
                      <p className="mt-1.5 text-xs text-slate-500 truncate">
                        {services.length ? (
                          <>
                            {services[0]}
                            {services.length > 1 && (
                              <span className="text-slate-400">
                                {" "}
                                +{services.length - 1} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">
                            {booking.services_count ?? 0} service
                            {(booking.services_count ?? 0) === 1 ? "" : "s"}
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        DELIVERY_BADGES[deliveryState(booking)]
                      }`}
                    >
                      {DELIVERY_LABELS[deliveryState(booking)]}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900 text-sm">
                    {booking.patient?.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MdLocalHospital className="w-3 h-3" />
                    {booking.facility?.name ?? "—"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <ShaClaimChip booking={booking} />
                    <span className="flex items-center gap-1">
                      <MdCalendarToday className="w-3 h-3" />
                      {new Date(booking.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>
                );
              })
            )}
            {!search.isSearching && pagination && pagination.last_page > 1 && (
              <div className="bg-white rounded-lg border border-slate-200">
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
        </div>
      </div>
    </PermissionGate>
  );
}
