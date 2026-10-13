"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FaChartLine,
  FaDownload,
  FaLink,
  FaBolt,
  FaServer,
  FaClipboardList,
  FaExchangeAlt,
  FaCheckCircle,
  FaXRay,
  FaPercentage,
  FaSyncAlt,
} from "react-icons/fa";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { Table } from "@/components/Table";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FilterBar } from "@/components/common/FilterBar";
import { FacilityFilter } from "@/components/common/FacilityFilter";
import { ConnectivityBadges } from "@/components/common/ConnectivityBadges";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { equipmentDeviceName } from "@/services/apiEquipment";
import {
  useEquipmentUtilization,
  useEquipmentUtilizationExport,
} from "@/features/equipmentUtilization/useEquipmentUtilization";
import {
  LINKED_OPTIONS,
  LIVE_OPTIONS,
  PULLING_WORKLIST_OPTIONS,
  ROUND_TRIP_FILTER,
  SENDING_RESULTS_OPTIONS,
  SORT_ORDER_OPTIONS,
  UTILIZATION_SORT_OPTIONS,
  type EquipmentUtilizationRow,
  type EquipmentUtilizationSortBy,
  type SortOrder,
} from "@/services/apiEquipmentUtilization";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  pending_installation: "bg-blue-50 text-blue-700 border-blue-200",
};

const statusBadge = (status: string) =>
  STATUS_BADGE[status] ?? "bg-slate-50 text-slate-700 border-slate-200";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

/** Tri-state filter: "" is no filter, not `false`. */
const asBoolean = (value: string): boolean | undefined =>
  value === "" ? undefined : value === "true";

/**
 * Conversion reads better with a bar than as a bare percentage, but only where
 * there is something to convert. Zero worklists means the machine has never
 * been given a job, which is not a 0% conversion rate.
 */
function ConversionBar({
  rate,
  worklistCount,
}: {
  rate: number;
  worklistCount: number;
}) {
  if (!worklistCount) {
    return (
      <span
        className="text-sm text-slate-400"
        title="No worklists have been raised against this machine"
      >
        —
      </span>
    );
  }

  const colour =
    rate >= 90 ? "bg-emerald-500" : rate >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="min-w-[5.5rem]">
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
 * Whether the machine closes the loop: it queries worklists and results come
 * back. Half-working is worth naming rather than folding into "not 360" — a
 * machine that pulls but never sends points at the C-STORE destination, and
 * one that sends but never pulls is pushing studies, not querying for them.
 */
function RoundTripBadge({ row }: { row: EquipmentUtilizationRow }) {
  if (row.round_trip) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border bg-violet-50 text-violet-700 border-violet-200"
        title="360 — this machine queries worklists and results come back"
      >
        <FaSyncAlt className="w-2.5 h-2.5" />
        360
      </span>
    );
  }

  if (row.pulling_worklist || row.sending_results) {
    const pullsOnly = row.pulling_worklist;
    const hint = pullsOnly
      ? "Pulls worklists, but no results have ever come back — check the C-STORE destination (AE title, host and port) points at VEMS"
      : "Sends results, but has never pulled a worklist — it is pushing studies rather than querying for them";

    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200"
        title={`Half the loop — ${hint}`}
      >
        {pullsOnly ? "Pulls only" : "Sends only"}
      </span>
    );
  }

  return (
    <span
      className="text-sm text-slate-400"
      title="Neither a worklist pull nor a study send has ever been recorded for this machine"
    >
      —
    </span>
  );
}

function UtilizationRow({ row }: { row: EquipmentUtilizationRow }) {
  const { equipment } = row;

  return (
    <Table.Row>
      <Table.Cell>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">
            {equipmentDeviceName(equipment.name)}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge(
              equipment.status,
            )}`}
          >
            {equipment.status_label ?? equipment.status}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          <span className="font-mono">{equipment.code}</span>
          {equipment.category_label && <span> · {equipment.category_label}</span>}
        </div>
      </Table.Cell>

      <Table.Cell>
        {row.ae_title ? (
          <span className="font-mono text-xs text-slate-600">
            {row.ae_title}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </Table.Cell>

      <Table.Cell>
        {row.facility ? (
          <>
            <div className="text-sm text-slate-900">{row.facility.name}</div>
            {row.facility.fr_code && (
              <div className="text-[11px] text-slate-400 font-mono">
                {row.facility.fr_code}
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-slate-400">Not mapped</span>
        )}
      </Table.Cell>

      <Table.Cell>
        {row.vendor ? (
          <>
            <div className="text-sm text-slate-900">{row.vendor.name}</div>
            {row.vendor.code && (
              <div className="text-[11px] text-slate-400 font-mono">
                {row.vendor.code}
              </div>
            )}
          </>
        ) : (
          <span className="text-xs text-slate-400">Not mapped</span>
        )}
      </Table.Cell>

      <Table.Cell>
        <ConnectivityBadges
          isConnected={row.live}
          linked={row.linked}
          lastSeenAt={row.last_seen_at}
          stacked
        />
      </Table.Cell>

      <Table.Cell>
        <RoundTripBadge row={row} />
      </Table.Cell>

      <Table.Cell>
        <span className="text-sm font-medium text-slate-900">
          {row.worklist_count.toLocaleString()}
        </span>
      </Table.Cell>

      <Table.Cell>
        <span className="text-sm text-slate-700">
          {row.pulled_count.toLocaleString()}
        </span>
      </Table.Cell>

      <Table.Cell>
        <span className="text-sm text-slate-700">
          {row.study_results_sent.toLocaleString()}
        </span>
      </Table.Cell>

      <Table.Cell>
        {row.non_sha_sent_count ? (
          <Link
            href="/studies/unmatched"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
            title="Studies sent from this machine with no VEMS order behind them"
          >
            {row.non_sha_sent_count.toLocaleString()}
          </Link>
        ) : (
          <span className="text-sm text-slate-400">0</span>
        )}
      </Table.Cell>

      <Table.Cell>
        <ConversionBar
          rate={row.conversion_rate}
          worklistCount={row.worklist_count}
        />
      </Table.Cell>

      <Table.Cell align="right">
        <span className="text-xs text-slate-500">
          {formatDateTime(row.last_seen_at)}
        </span>
      </Table.Cell>
    </Table.Row>
  );
}

/**
 * Equipment utilization.
 *
 * The volume view of the estate: what each machine was asked to do and what it
 * actually did. Every machine matching the filters is listed, including the
 * ones with all-zero counts — a machine sitting idle is exactly what the
 * report is read to find, so hiding it by default would defeat the purpose.
 * The boolean filters are how you choose to hide it.
 */
function EquipmentUtilizationContent() {
  const [page, setPage] = useState(1);
  const [vendor, setVendor] = useState("");
  const [facility, setFacility] = useState("");
  const [linked, setLinked] = useState("");
  const [live, setLive] = useState("");
  const [pullingWorklist, setPullingWorklist] = useState("");
  const [sendingResults, setSendingResults] = useState("");
  const [sortBy, setSortBy] = useState<EquipmentUtilizationSortBy>(
    "worklist_count",
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const filters = useMemo(
    () => ({
      vendor_id: vendor || undefined,
      facility_id: facility || undefined,
      linked: asBoolean(linked),
      live: asBoolean(live),
      pulling_worklist: asBoolean(pullingWorklist),
      sending_results: asBoolean(sendingResults),
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [
      vendor,
      facility,
      linked,
      live,
      pullingWorklist,
      sendingResults,
      sortBy,
      sortOrder,
    ],
  );

  const {
    rows,
    summary,
    availableFilters,
    pagination,
    isLoading,
    error,
    refetch,
  } = useEquipmentUtilization({ page, per_page: 20, ...filters });

  // The export covers everything these filters select, not the page on screen.
  const { download, isExporting } = useEquipmentUtilizationExport(filters);

  /** Clicking a sorted column flips it; a different one starts descending. */
  const handleSort = (key: string) => {
    if (key === sortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(key as EquipmentUtilizationSortBy);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // 360 is the two evidence filters together — there is no `round_trip` param.
  const roundTripOnly =
    pullingWorklist === String(ROUND_TRIP_FILTER.pulling_worklist) &&
    sendingResults === String(ROUND_TRIP_FILTER.sending_results);

  const toggleRoundTrip = () => {
    const next = roundTripOnly
      ? ""
      : String(ROUND_TRIP_FILTER.pulling_worklist);
    setPullingWorklist(next);
    setSendingResults(
      roundTripOnly ? "" : String(ROUND_TRIP_FILTER.sending_results),
    );
    setPage(1);
  };

  const activeFilterCount = [
    vendor,
    facility,
    linked,
    live,
    pullingWorklist,
    sendingResults,
  ].filter(Boolean).length;

  if (error) {
    const httpStatus = (error as { response?: { status?: number } })?.response
      ?.status;
    if (httpStatus === 403) {
      return (
        <ErrorState
          title="Not Available For This Account"
          message="Equipment utilization is an oversight report, so it is limited to system-level admin accounts."
          fullScreen
        />
      );
    }

    return (
      <ErrorState
        title="Unable to Load Equipment Utilization"
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
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <FaChartLine className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Equipment Utilization
                </h1>
                <p className="text-sm text-slate-500">
                  Worklists raised against each machine, and what it pulled and
                  returned
                </p>
              </div>
            </div>

            <div className="lg:flex-1" />

            <button
              onClick={download}
              disabled={isExporting}
              title="Download every machine these filters select, with its worklist, pull and result counts"
              className="shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FaDownload className="w-3.5 h-3.5" />
              {isExporting ? "Preparing..." : "Export"}
            </button>
          </div>

          <FilterBar
            className="mt-3"
            activeCount={activeFilterCount}
            onReset={() => {
              setVendor("");
              setFacility("");
              setLinked("");
              setLive("");
              setPullingWorklist("");
              setSendingResults("");
              setPage(1);
            }}
          >
            {!!availableFilters?.vendor?.length && (
              <SearchableSelect
                label=""
                compact
                className="w-full lg:w-48"
                value={vendor}
                onChange={(value) => {
                  setVendor(value);
                  setPage(1);
                }}
                placeholder="All vendors"
                searchPlaceholder="Search vendors..."
                options={availableFilters.vendor}
              />
            )}

            <FacilityFilter
              value={facility}
              onChange={(value) => {
                setFacility(value);
                setPage(1);
              }}
              hideLabel
              compact
              className="w-full lg:w-56"
            />

            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-44"
              value={linked}
              onChange={(value) => {
                setLinked(value);
                setPage(1);
              }}
              placeholder="Link status"
              options={availableFilters?.linked ?? LINKED_OPTIONS}
            />
            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-44"
              value={live}
              onChange={(value) => {
                setLive(value);
                setPage(1);
              }}
              placeholder="Connection"
              options={availableFilters?.live ?? LIVE_OPTIONS}
            />
            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-52"
              value={pullingWorklist}
              onChange={(value) => {
                setPullingWorklist(value);
                setPage(1);
              }}
              placeholder="Pulling worklists"
              options={
                availableFilters?.pulling_worklist ?? PULLING_WORKLIST_OPTIONS
              }
            />
            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-52"
              value={sendingResults}
              onChange={(value) => {
                setSendingResults(value);
                setPage(1);
              }}
              placeholder="Sending results"
              options={
                availableFilters?.sending_results ?? SENDING_RESULTS_OPTIONS
              }
            />
            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-48"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value as EquipmentUtilizationSortBy);
                setPage(1);
              }}
              placeholder="Sort by"
              options={availableFilters?.sort_by ?? UTILIZATION_SORT_OPTIONS}
            />
            <SearchableSelect
              label=""
              compact
              className="w-full lg:w-40"
              value={sortOrder}
              onChange={(value) => {
                setSortOrder(value as SortOrder);
                setPage(1);
              }}
              placeholder="Order"
              options={availableFilters?.sort_order ?? SORT_ORDER_OPTIONS}
            />
          </FilterBar>
        </div>

        {/* Totals across the whole filtered set, not just this page. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            compact
            title="Equipment"
            mainValue={(summary?.equipment ?? 0).toLocaleString()}
            subtitle="Matching these filters"
            className="border border-slate-200"
          >
            <FaServer className="w-4 h-4 text-slate-400" />
          </StatCard>
          <StatCard
            compact
            title="Linked"
            mainValue={(
              summary?.by_state?.linked ?? 0
            ).toLocaleString()}
            subtitle="Seen on the network"
            onClick={() => {
              setLinked(linked === "true" ? "" : "true");
              setPage(1);
            }}
            className={`border ${
              linked === "true"
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-slate-200"
            }`}
          >
            <FaLink className="w-4 h-4 text-violet-500" />
          </StatCard>
          <StatCard
            compact
            title="Live"
            mainValue={(summary?.by_state?.live ?? 0).toLocaleString()}
            subtitle="Connected right now"
            onClick={() => {
              setLive(live === "true" ? "" : "true");
              setPage(1);
            }}
            className={`border ${
              live === "true"
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-slate-200"
            }`}
          >
            <FaBolt className="w-4 h-4 text-emerald-500" />
          </StatCard>
          {/* The 360 count and the filter pair that lists exactly these
              machines are the same evidence, so one click on the card turns
              both on and both off again. */}
          <StatCard
            compact
            title="End to End (360)"
            mainValue={(summary?.by_state?.round_trip ?? 0).toLocaleString()}
            subtitle="Pulls worklists, returns results"
            onClick={toggleRoundTrip}
            className={`border ${
              roundTripOnly
                ? "border-blue-500 ring-1 ring-blue-500"
                : "border-slate-200"
            }`}
          >
            <FaSyncAlt className="w-4 h-4 text-violet-500" />
          </StatCard>
        </div>

        {/* Volume across the same filtered set. */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            compact
            title="Worklists"
            mainValue={(summary?.worklist_count ?? 0).toLocaleString()}
            subtitle="Raised against them"
            className="border border-slate-200"
          >
            <FaClipboardList className="w-4 h-4 text-blue-500" />
          </StatCard>
          <StatCard
            compact
            title="Pulled"
            mainValue={(summary?.pulled_count ?? 0).toLocaleString()}
            subtitle="MWL queries"
            className="border border-slate-200"
          >
            <FaExchangeAlt className="w-4 h-4 text-sky-500" />
          </StatCard>
          <StatCard
            compact
            title="Results Sent"
            mainValue={(summary?.study_results_sent ?? 0).toLocaleString()}
            subtitle="Came back as a study"
            className="border border-slate-200"
          >
            <FaCheckCircle className="w-4 h-4 text-emerald-500" />
          </StatCard>
          <StatCard
            compact
            title="Non-SHA Sent"
            mainValue={(summary?.non_sha_sent_count ?? 0).toLocaleString()}
            subtitle="No order behind them"
            href="/studies/unmatched"
            className="border border-slate-200"
          >
            <FaXRay className="w-4 h-4 text-amber-500" />
          </StatCard>
          <StatCard
            compact
            title="Conversion"
            mainValue={`${summary?.conversion_rate ?? 0}%`}
            subtitle="Results ÷ worklists"
            className="border border-slate-200"
          >
            <FaPercentage className="w-4 h-4 text-indigo-500" />
          </StatCard>
        </div>

        {/* Utilization */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table
            className="w-full"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell sortable sortKey="name">
                  Equipment
                </Table.HeaderCell>
                <Table.HeaderCell>AE Title</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Vendor</Table.HeaderCell>
                <Table.HeaderCell>Connection</Table.HeaderCell>
                <Table.HeaderCell>End to End</Table.HeaderCell>
                <Table.HeaderCell
                  sortable
                  sortKey="worklist_count"
                  align="right"
                >
                  Worklists
                </Table.HeaderCell>
                <Table.HeaderCell sortable sortKey="pulled_count" align="right">
                  Pulled
                </Table.HeaderCell>
                <Table.HeaderCell
                  sortable
                  sortKey="study_results_sent"
                  align="right"
                >
                  Results
                </Table.HeaderCell>
                <Table.HeaderCell
                  sortable
                  sortKey="non_sha_sent_count"
                  align="right"
                >
                  Non-SHA
                </Table.HeaderCell>
                <Table.HeaderCell sortable sortKey="conversion_rate">
                  Conversion
                </Table.HeaderCell>
                <Table.HeaderCell
                  sortable
                  sortKey="last_seen_at"
                  align="right"
                >
                  Last Seen
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Loading colSpan={12} rows={8} />
              ) : rows.length === 0 ? (
                <Table.Empty colSpan={12}>
                  {activeFilterCount > 0
                    ? "No equipment matches these filters. Machines with no activity are included unless you filter them out."
                    : "No equipment recorded yet."}
                </Table.Empty>
              ) : (
                rows.map((row) => (
                  <UtilizationRow key={row.equipment.id} row={row} />
                ))
              )}
            </Table.Body>
          </Table>

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

        <Link
          href="/readiness"
          className="inline-block text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          See which machines are proven working end to end →
        </Link>
      </div>
    </div>
  );
}

export default function EquipmentUtilizationPage() {
  return (
    <PermissionGate permission={Permission.VIEW_EQUIPMENT_STATUS}>
      <EquipmentUtilizationContent />
    </PermissionGate>
  );
}
