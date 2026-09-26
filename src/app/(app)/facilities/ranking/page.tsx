"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaTrophy,
  FaCalendarAlt,
  FaCheckCircle,
  FaUserInjured,
  FaXRay,
} from "react-icons/fa";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { KephLevelFilter } from "@/components/common/KephLevelFilter";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useFacilityRanking } from "@/features/readiness/useFacilityReadiness";
import { PERIOD_PRESETS } from "@/services/apiPingRequests";
import {
  RANKING_SORT_OPTIONS,
  type FacilityRankingSortBy,
  type RankingRow,
} from "@/services/apiFacilityRanking";

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
  const [sortBy, setSortBy] = useState<FacilityRankingSortBy>("total_bookings");
  const search = useSearchControl(() => setPage(1));

  const {
    rows,
    summary,
    availableFilters,
    pagination,
    isLoading,
    error,
    refetch,
  } = useFacilityRanking({
    page,
    per_page: 20,
    search: search.term || undefined,
    period: period || undefined,
    county_id: county || undefined,
    keph_level: kephLevel || undefined,
    sort_by: sortBy,
  });

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
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FaTrophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Facility Ranking
                </h1>
                <p className="text-sm text-slate-500">
                  {summary?.facilities ?? 0} facilities by booking volume
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search by facility name or FR code..."
              />
            </div>

            <SearchableSelect
              label=""
              compact
              className="shrink-0 w-full lg:w-44"
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
              className="shrink-0 w-full lg:w-48"
              value={sortBy}
              onChange={(value) => {
                setSortBy(value as FacilityRankingSortBy);
                setPage(1);
              }}
              placeholder="Rank by"
              options={availableFilters?.sort_by ?? RANKING_SORT_OPTIONS}
            />

            <KephLevelFilter
              value={kephLevel}
              onChange={(value) => {
                setKephLevel(value);
                setPage(1);
              }}
              options={availableFilters?.keph_level}
              className="shrink-0 w-full lg:w-40"
            />

            {!!availableFilters?.county?.length && (
              <SearchableSelect
                label=""
                compact
                className="shrink-0 w-full lg:w-44"
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
          </div>
        </div>

        {/* Totals across the whole ranking, not just this page */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>#</Table.HeaderCell>
                  <Table.HeaderCell>Facility</Table.HeaderCell>
                  <Table.HeaderCell>Bookings</Table.HeaderCell>
                  <Table.HeaderCell>Completion</Table.HeaderCell>
                  <Table.HeaderCell>Patients</Table.HeaderCell>
                  <Table.HeaderCell>Non-SHA</Table.HeaderCell>
                  <Table.HeaderCell align="right">Last Booking</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Loading colSpan={7} rows={8} />
                ) : rows.length === 0 ? (
                  <Table.Empty colSpan={7}>
                    No facilities match these filters.
                  </Table.Empty>
                ) : (
                  rows.map((row: RankingRow) => (
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
                          {row.bookings.pending} pending ·{" "}
                          {row.bookings.cancelled} cancelled
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <CompletionBar rate={row.bookings.completion_rate} />
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {row.bookings.patients.toLocaleString()}
                        </span>
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
                        <span className="text-xs text-slate-500">
                          {formatDate(row.bookings.last_booking_at)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
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
