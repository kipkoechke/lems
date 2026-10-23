"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaTrophy,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserInjured,
  FaXRay,
  FaPaperPlane,
  FaClipboardCheck,
  FaFileDownload,
  FaChevronDown,
  FaCheck,
} from "react-icons/fa";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FilterBar } from "@/components/common/FilterBar";
import { KephLevelFilter } from "@/components/common/KephLevelFilter";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { useSearchControl } from "@/hooks/useSearchControl";
import {
  useFacilityMachines,
  useFacilityRanking,
  useFullFacilityRanking,
} from "@/features/readiness/useFacilityReadiness";
import { useFacilityRankingExport } from "@/features/readiness/useFacilityRankingExport";
import { PERIOD_PRESETS } from "@/services/apiPingRequests";
import {
  applyClientOrder,
  CLIENT_ORDERS,
  isClientOrder,
  RANKING_SORT_OPTIONS,
  REPORT_ONLY_ORDERS,
  withMachines,
  type RankingOrder,
  type ReportOrder,
  type RankingRow,
  type RankingRowWithMachines,
} from "@/services/apiFacilityRanking";

const PER_PAGE = 20;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

/** Completion rates read better with a bar than as a bare percentage. */
function CompletionBar({ rate }: { rate: number }) {
  const colour =
    rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="min-w-[6rem]">
      <p className="text-sm font-medium text-slate-900">{rate}%</p>
      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden mt-1">
        <div
          className={`h-full rounded-full ${colour}`}
          style={{ width: `${Math.min(Math.max(rate, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * What the Claims cell's two numbers mean, for the hover.
 *
 * Worth spelling out because the two rates have different denominators — a
 * reader who assumes both are shares of bookings will read the verification
 * rate as far lower than it is.
 */
const shaTooltip = (row: RankingRow): string => {
  const sha = row.sha;
  if (!sha) return "This deployment does not report claim facts yet";

  return [
    `${sha.submitted.toLocaleString()} of ${row.bookings.total.toLocaleString()} bookings sent to SHA (${sha.submission_rate}%)`,
    `${sha.verified.toLocaleString()} answered by SHA (${sha.verification_rate}% of submitted)`,
  ].join(" · ");
};

/**
 * When the facility last sent a result back, or that it never has.
 *
 * "Never" is in amber, not grey: a facility that has machines but has never
 * returned a study is exactly what this column is read to find.
 */
function LastResult({ row }: { row: RankingRowWithMachines }) {
  if (!row.machines) {
    return <span className="text-slate-400">No machines</span>;
  }
  if (!row.machines.lastResultAt) {
    return (
      <span
        className="font-medium text-amber-600"
        title={`None of its ${row.machines.total} machine${row.machines.total === 1 ? "" : "s"} has ever sent a study back`}
      >
        Never sent
      </span>
    );
  }
  return (
    <span
      className="text-slate-600"
      title={`${row.machines.sending} of ${row.machines.total} machines have sent results back`}
    >
      {formatDate(row.machines.lastResultAt.replace(" ", "T"))}
    </span>
  );
}

/**
 * The facility's machines against the four checks, in the order they have to
 * be met: linked, then live, then pulling worklists, then sending results.
 *
 * Linked leads as "x of y" because it is the one the facility acts on first;
 * the other three follow as counts. A zero is amber when the facility has
 * machines that could be doing it — "0 linked" on three machines is the
 * finding, not an empty cell.
 */
function MachineStatus({
  row,
  compact = false,
}: {
  row: RankingRowWithMachines;
  compact?: boolean;
}) {
  const facts = row.machines;
  if (!facts) {
    return <span className="text-xs text-slate-400">No machines</span>;
  }

  const zero = (value: number) => (value === 0 ? "text-amber-600" : "");
  const rest = [
    { value: facts.live, label: "live" },
    { value: facts.worklist, label: "worklist" },
    { value: facts.sending, label: "sending" },
  ];

  return (
    <div
      className={compact ? "text-[11px] text-slate-500" : ""}
      title="Linked: has reached VEMS. Live: connected now. Worklist: has pulled a worklist. Sending: has sent a study back. Decommissioned machines are not counted."
    >
      <span
        className={`${compact ? "" : "text-sm"} font-medium ${zero(facts.linked) || "text-slate-900"}`}
      >
        {facts.linked} of {facts.total} linked
      </span>
      {compact ? " · " : <br />}
      <span className={compact ? "" : "text-[11px] text-slate-400"}>
        {rest.map((item, index) => (
          <span key={item.label}>
            {index > 0 && " · "}
            <span className={zero(item.value)}>
              {item.value} {item.label}
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * Download the ranking as a PDF, ranked by any of the orders.
 *
 * A menu rather than one button: the PDF used to follow the "Rank by" filter,
 * which worked but was invisible — it hid under Filters on a phone, and a
 * reader wanting three reports had to re-sort the page three times.
 */
function PdfMenu({
  current,
  options,
  exporting,
  progress,
  onDownload,
}: {
  current: RankingOrder;
  options: { value: ReportOrder; label: string }[];
  exporting: ReportOrder | null;
  /** How far the report has got, 0–100, while one is being built. */
  progress: number;
  onDownload: (order: ReportOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={exporting !== null}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Download the facility performance report as a PDF, with the filters applied to it"
        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FaFileDownload className="w-3.5 h-3.5" />
        {/* The report reads every booking, which takes a while; a number
            that moves says it is working. */}
        <span className={exporting ? "tabular-nums" : "hidden sm:inline"}>
          {exporting ? `Preparing ${progress}%` : "Report"}
        </span>
        <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-60 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Download report ranked by
          </p>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDownload(option.value);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              {option.label}
              {option.value === current && (
                <FaCheck
                  className="w-3 h-3 text-blue-600"
                  title="The order on screen"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Facilities ranked by booking volume.
 *
 * The completion rate deliberately excludes cancelled bookings — a booking
 * that was cancelled was never expected to complete, so counting it against
 * the facility would punish them for cancellations they may not have caused.
 */
function FacilityRankingContent() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("");
  const [county, setCounty] = useState("");
  const [kephLevel, setKephLevel] = useState("");
  const [sortBy, setSortBy] = useState<RankingOrder>("total_bookings");
  const search = useSearchControl(() => setPage(1));

  const filters = {
    search: search.term || undefined,
    period: period || undefined,
    county_id: county || undefined,
    keph_level: kephLevel || undefined,
  };

  // "Last result sent" is an order the API cannot apply, so for that one the
  // whole ranking is fetched and ordered here; every other order stays a
  // paged query the API sorts. Only one of the two queries runs at a time.
  const clientOrder = isClientOrder(sortBy);
  const paged = useFacilityRanking(
    {
      page,
      per_page: PER_PAGE,
      ...filters,
      sort_by: clientOrder ? "total_bookings" : sortBy,
    },
    { enabled: !clientOrder },
  );
  const full = useFullFacilityRanking(
    { ...filters, sort_by: "total_bookings" },
    clientOrder,
  );
  const { machines } = useFacilityMachines();

  const ordered = isClientOrder(sortBy)
    ? applyClientOrder(sortBy, withMachines(full.rows, machines))
    : [];
  const rows: RankingRowWithMachines[] = clientOrder
    ? ordered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : withMachines(paged.rows, machines);
  const summary = clientOrder ? full.summary : paged.summary;
  const pagination = clientOrder
    ? {
        current_page: page,
        last_page: Math.max(1, Math.ceil(ordered.length / PER_PAGE)),
        total: ordered.length,
        per_page: PER_PAGE,
        from: ordered.length ? (page - 1) * PER_PAGE + 1 : 0,
        to: Math.min(page * PER_PAGE, ordered.length),
      }
    : paged.pagination;
  const isLoading = clientOrder ? full.isLoading : paged.isLoading;
  const error = clientOrder ? full.error : paged.error;
  const refetch = clientOrder ? full.refetch : paged.refetch;
  // Filter options come from the paged query; keep its last answer while the
  // full one is in charge.
  const availableFilters = paged.availableFilters;

  const orderOptions = [
    ...((availableFilters?.sort_by as
      { value: RankingOrder; label: string }[] | undefined) ??
      RANKING_SORT_OPTIONS),
    ...CLIENT_ORDERS,
  ];
  const orderLabel =
    orderOptions.find((option) => option.value === sortBy)?.label ??
    "Total bookings";

  // The export covers everything these filters select, not the page on screen,
  // in whichever order the menu asks for.
  const { download, exporting, progress } = useFacilityRankingExport(
    { ...filters, search: undefined },
    {
      // The report names the filters it was built with, so the labels are read
      // from the API's own option lists rather than echoing the raw values.
      period:
        (availableFilters?.period ?? PERIOD_PRESETS).find(
          (option) => option.value === period,
        )?.label ?? "All time",
      county:
        availableFilters?.county?.find((option) => option.value === county)
          ?.label ??
        (county || undefined),
      kephLevel: kephLevel || undefined,
    },
  );

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Ranking"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaTrophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Facility Ranking
                </h1>
                <p className="text-sm text-slate-500">
                  {summary?.facilities ?? 0} facilities by{" "}
                  {orderLabel.toLowerCase()}
                </p>
              </div>
            </div>

            {/* The search takes a line of its own until there is room to sit
                beside the title, and never squeezes the download off the row. */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <SearchField
                  value={search.input}
                  onChange={search.onInputChange}
                  onSearch={search.submit}
                  onClear={search.clear}
                  placeholder="Search by facility name or FR code..."
                />
              </div>

              <PdfMenu
                current={sortBy}
                options={[...orderOptions, ...REPORT_ONLY_ORDERS]}
                exporting={exporting}
                progress={progress}
                onDownload={download}
              />
            </div>
          </div>

          {/* The filter row wraps rather than running off the card: with four
              controls a fixed row overflows long before the widest screen. */}
          <FilterBar
            className="mt-3"
            activeCount={[period, county, kephLevel].filter(Boolean).length}
            onReset={() => {
              setPeriod("");
              setCounty("");
              setKephLevel("");
              setPage(1);
            }}
          >
            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-44"
              value={period}
              onChange={(value) => {
                setPeriod(value);
                setPage(1);
              }}
              placeholder="All time"
              options={availableFilters?.period ?? PERIOD_PRESETS}
            />

            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-48"
              value={sortBy}
              onChange={(value) => {
                setSortBy((value || "total_bookings") as RankingOrder);
                setPage(1);
              }}
              placeholder="Rank by"
              options={orderOptions}
            />

            <KephLevelFilter
              value={kephLevel}
              onChange={(value) => {
                setKephLevel(value);
                setPage(1);
              }}
              options={availableFilters?.keph_level}
              className="w-full lg:w-40"
            />

            {!!availableFilters?.county?.length && (
              <SearchableSelect
                label=""
                compact
                className="w-full lg:w-44"
                value={county}
                onChange={(value) => {
                  setCounty(value);
                  setPage(1);
                }}
                placeholder="All counties"
                searchPlaceholder="Search counties..."
                options={availableFilters.county}
              />
            )}
          </FilterBar>
        </div>

        {/* Totals across the whole ranking, not just this page */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <StatCard
            compact
            title="Bookings"
            mainValue={(summary?.total_bookings ?? 0).toLocaleString()}
            subtitle={`${summary?.pending ?? 0} pending`}
            className="border border-slate-200"
          >
            <FaCalendarAlt className="w-4 h-4 text-blue-500" />
          </StatCard>
          <StatCard
            compact
            title="Completed"
            mainValue={(summary?.completed ?? 0).toLocaleString()}
            subtitle={`${summary?.completion_rate ?? 0}% completion`}
            className="border border-slate-200"
          >
            <FaCheckCircle className="w-4 h-4 text-emerald-500" />
          </StatCard>
          <StatCard
            compact
            title="Cancelled"
            mainValue={(summary?.cancelled ?? 0).toLocaleString()}
            subtitle="Excluded from the rate"
            className="border border-slate-200"
          />
          <StatCard
            compact
            title="Patients"
            mainValue={(summary?.patients ?? 0).toLocaleString()}
            subtitle="Unique"
            className="border border-slate-200"
          >
            <FaUserInjured className="w-4 h-4 text-purple-500" />
          </StatCard>
          {/* The two SHA claim totals with their rates. The rates differ in
              denominator: submission is of all bookings, verification is of
              the claims actually submitted. */}
          <StatCard
            compact
            title="Claims Submitted"
            mainValue={(summary?.sha_submitted ?? 0).toLocaleString()}
            subtitle={`${summary?.sha_submission_rate ?? 0}% of bookings`}
            className="border border-slate-200"
          >
            <FaPaperPlane className="w-4 h-4 text-violet-500" />
          </StatCard>
          <StatCard
            compact
            title="Claims Verified"
            mainValue={(summary?.sha_verified ?? 0).toLocaleString()}
            subtitle={`${summary?.sha_verification_rate ?? 0}% of submitted`}
            className="border border-slate-200"
          >
            <FaClipboardCheck className="w-4 h-4 text-emerald-500" />
          </StatCard>
          <StatCard
            compact
            title="Non-SHA Studies"
            mainValue={(summary?.non_sha_studies ?? 0).toLocaleString()}
            subtitle="No order behind them"
            onClick={() => router.push("/studies/unmatched")}
            className="border border-slate-200"
          >
            <FaXRay className="w-4 h-4 text-amber-500" />
          </StatCard>
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.HeaderCell>Facility</Table.HeaderCell>
                  <Table.HeaderCell>Bookings</Table.HeaderCell>
                  <Table.HeaderCell>Completion</Table.HeaderCell>
                  {/* Patients moved under Bookings to make room: it is a
                      second reading of the same volume, where the machines
                      are a different question — can this facility send at
                      all. It is still a ranking order and a PDF column. */}
                  <Table.HeaderCell>Machines</Table.HeaderCell>
                  <Table.HeaderCell>Claims</Table.HeaderCell>
                  <Table.HeaderCell>Non-SHA</Table.HeaderCell>
                  {/* Both dates in one column: the table already fills its
                      card, and the pair reads as "how recently is this
                      facility active" — booking in, result back. */}
                  <Table.HeaderCell align="right">
                    Last Activity
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Loading colSpan={8} rows={8} />
                ) : rows.length === 0 ? (
                  <Table.Empty colSpan={8}>
                    No facilities match these filters.
                  </Table.Empty>
                ) : (
                  rows.map((row) => (
                    <Table.Row key={row.facility.id}>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            row.rank <= 3
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {row.rank}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="font-medium text-slate-900">
                          {row.facility.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {[
                            row.facility.fr_code,
                            row.facility.county?.name,
                            row.facility.keph_level,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm font-medium text-slate-900">
                          {row.bookings.total.toLocaleString()}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {row.bookings.patients.toLocaleString()} patients
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {row.bookings.pending} pending ·{" "}
                          {row.bookings.cancelled} cancelled
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <CompletionBar rate={row.bookings.completion_rate} />
                      </Table.Cell>
                      <Table.Cell>
                        <MachineStatus row={row} />
                      </Table.Cell>
                      <Table.Cell>
                        {/* Both counts in one cell: two columns for two
                            numbers spends width the pairing does not need, and
                            read together they answer what the ranking is
                            checked for — was the claim sent, and did SHA answer
                            for it. The rates go in the tooltip, where they
                            explain the pair without crowding it. */}
                        <span
                          className="text-sm text-slate-900"
                          title={shaTooltip(row)}
                        >
                          {(row.sha?.submitted ?? 0).toLocaleString()}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {row.sha
                            ? `${row.sha.verified.toLocaleString()} verified`
                            : "not reported"}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {row.non_sha_studies?.total ? (
                          <button
                            onClick={() =>
                              router.push(
                                `/studies/unmatched?facility_id=${row.facility.id}`,
                              )
                            }
                            className="text-sm font-medium text-amber-600 hover:text-amber-700"
                            title="Studies performed on this facility's machines with no order behind them"
                          >
                            {row.non_sha_studies.total}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">0</span>
                        )}
                      </Table.Cell>
                      <Table.Cell align="right">
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          <span className="text-slate-400">Booking </span>
                          {formatDate(row.bookings.last_booking_at)}
                        </div>
                        <div className="text-xs whitespace-nowrap">
                          <span className="text-slate-400">Result </span>
                          <LastResult row={row} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Phones get one card per facility. The claim rates live in a
              hover title on the table, which a touch screen never shows, so
              the card says both counts in words instead. */}
          <div className="md:hidden divide-y divide-slate-100">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              ))
            ) : rows.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No facilities match these filters.
              </p>
            ) : (
              rows.map((row) => (
                <div key={row.facility.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        row.rank <= 3
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 line-clamp-2">
                        {row.facility.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {[
                          row.facility.fr_code,
                          row.facility.county?.name,
                          row.facility.keph_level,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Bookings</p>
                      <p className="text-sm font-medium text-slate-900">
                        {row.bookings.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Patients</p>
                      <p className="text-sm text-slate-900">
                        {row.bookings.patients.toLocaleString()}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Non-SHA</p>
                      {row.non_sha_studies?.total ? (
                        <button
                          onClick={() =>
                            router.push(
                              `/studies/unmatched?facility_id=${row.facility.id}`,
                            )
                          }
                          className="block text-left text-sm font-medium text-amber-600 leading-5"
                        >
                          {row.non_sha_studies.total}
                        </button>
                      ) : (
                        <p className="text-sm text-slate-400">0</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <CompletionBar rate={row.bookings.completion_rate} />
                    <p className="text-[11px] text-slate-400 text-right">
                      {row.sha
                        ? `${row.sha.submitted.toLocaleString()} claims sent · ${row.sha.verified.toLocaleString()} verified`
                        : "Claims not reported"}
                      <br />
                      Last booking {formatDate(row.bookings.last_booking_at)}
                      <br />
                      Last result <LastResult row={row} />
                    </p>
                  </div>

                  <MachineStatus row={row} compact />
                </div>
              ))
            )}
          </div>

          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              perPage={pagination.per_page}
              from={pagination.from}
              to={pagination.to}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function FacilityRankingPage() {
  return (
    <PermissionGate permission={Permission.VIEW_REPORTS}>
      <FacilityRankingContent />
    </PermissionGate>
  );
}
