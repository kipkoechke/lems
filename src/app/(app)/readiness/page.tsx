"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaClipboardCheck,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaExclamationTriangle,
  FaBuilding,
  FaTruck,
} from "react-icons/fa";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { KephLevelFilter } from "@/components/common/KephLevelFilter";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useFacilityReadiness } from "@/features/readiness/useFacilityReadiness";
import {
  READINESS_CHECKS,
  READINESS_LABELS,
  READINESS_OPTIONS,
  readinessClasses,
  type FacilityReadinessRow,
  type ReadinessEquipment,
  type ReadinessLevel,
} from "@/services/apiFacilityReadiness";

const OWNERSHIP_OPTIONS = [
  { value: "vendor", label: "Vendor supplied" },
  { value: "facility", label: "Facility owned" },
];

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "never";

/** One of the four checks, as a tick or a cross with its reason on hover. */
function CheckPip({
  passed,
  label,
  hint,
}: {
  passed: boolean;
  label: string;
  hint: string;
}) {
  return (
    <span
      title={`${label}: ${passed ? "yes" : "no"} — ${hint}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        passed
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-50 text-slate-400 border-slate-200"
      }`}
    >
      {passed ? (
        <FaCheck className="w-2.5 h-2.5" />
      ) : (
        <FaTimes className="w-2.5 h-2.5" />
      )}
      {label}
    </span>
  );
}

function EquipmentRow({ equipment }: { equipment: ReadinessEquipment }) {
  return (
    <div className="px-4 py-3 border-t border-slate-100">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900">{equipment.name}</span>
            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
              {equipment.code}
            </span>
            {equipment.modality && (
              <span className="text-xs text-slate-500">
                {equipment.modality}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                equipment.ownership_type === "vendor"
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-sky-50 text-sky-700 border-sky-200"
              }`}
            >
              {equipment.ownership_type === "vendor" ? (
                <>
                  <FaTruck className="w-2.5 h-2.5" />
                  {equipment.vendor?.name || "Vendor"}
                </>
              ) : (
                <>
                  <FaBuilding className="w-2.5 h-2.5" /> Facility
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {READINESS_CHECKS.map((check) => (
              <CheckPip
                key={check.key}
                passed={equipment.checks[check.key]}
                label={check.label}
                hint={check.hint}
              />
            ))}
          </div>

          {/* What it would take to finish the job, most fundamental first. */}
          {!!equipment.notes?.length && (
            <ul className="mt-2 space-y-1">
              {equipment.notes.map((note) => (
                <li
                  key={note.code}
                  className="flex gap-2 text-xs text-slate-600"
                >
                  <FaExclamationTriangle
                    className={`w-3 h-3 mt-0.5 shrink-0 ${
                      note.level === "error"
                        ? "text-red-500"
                        : "text-amber-500"
                    }`}
                  />
                  <span>{note.message}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400">
            <span>Last seen {formatDateTime(equipment.activity?.last_seen_at)}</span>
            <span>
              Worklist pulled{" "}
              {formatDateTime(equipment.activity?.last_worklist_pull_at)}
            </span>
            <span>
              Study sent {formatDateTime(equipment.activity?.last_study_sent_at)}
            </span>
            {!!equipment.tests?.total && (
              <span>
                {equipment.tests.succeeded}/{equipment.tests.total} tests
                returned a study
              </span>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${readinessClasses(
            equipment.readiness,
          )}`}
        >
          {READINESS_LABELS[equipment.readiness]} · {equipment.score}/4
        </span>
      </div>
    </div>
  );
}

function FacilityCard({ row }: { row: FacilityReadinessRow }) {
  // Anything needing attention is worth opening on arrival; a fully ready
  // facility is not what this report is read for.
  const [open, setOpen] = useState(
    (row.summary.by_readiness?.ready ?? 0) < row.summary.total,
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex flex-wrap items-center gap-3 text-left hover:bg-slate-50 transition-colors"
      >
        {open ? (
          <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        ) : (
          <FaChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{row.facility.name}</p>
          <p className="text-xs text-slate-500">
            {[
              row.facility.fr_code,
              row.facility.county?.name,
              row.facility.keph_level,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(["ready", "attention", "not_ready"] as ReadinessLevel[]).map(
            (level) => {
              const count = row.summary.by_readiness?.[level] ?? 0;
              if (!count) return null;
              return (
                <span
                  key={level}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${readinessClasses(
                    level,
                  )}`}
                >
                  {count} {READINESS_LABELS[level].toLowerCase()}
                </span>
              );
            },
          )}
          <span className="text-xs text-slate-400 ml-1">
            {row.summary.total} unit{row.summary.total === 1 ? "" : "s"}
          </span>
        </div>
      </button>

      {open &&
        row.equipment.map((equipment) => (
          <EquipmentRow key={equipment.id} equipment={equipment} />
        ))}
    </div>
  );
}

/**
 * Facility readiness.
 *
 * The follow-up report. Its value is that the checks are evidence-based: a
 * machine is worklist-ready only once a C-FIND has actually been logged, and
 * results-ready only once a study has actually come back. "Configured
 * correctly" is not the same claim, so the page never presents it as one.
 */
function FacilityReadinessContent() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [readiness, setReadiness] = useState("");
  const [ownership, setOwnership] = useState("");
  const [county, setCounty] = useState("");
  const [vendor, setVendor] = useState("");
  const [kephLevel, setKephLevel] = useState("");
  const search = useSearchControl(() => setPage(1));

  const {
    facilities,
    summary,
    availableFilters,
    pagination,
    isLoading,
    error,
    refetch,
  } = useFacilityReadiness({
    page,
    per_page: 20,
    search: search.term || undefined,
    readiness: (readiness || undefined) as ReadinessLevel | undefined,
    ownership_type: (ownership || undefined) as "vendor" | "facility" | undefined,
    county_id: county || undefined,
    vendor_id: vendor || undefined,
    keph_level: kephLevel || undefined,
  });

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Readiness"
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
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaClipboardCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Facility Readiness
                </h1>
                <p className="text-sm text-slate-500">
                  What it would take to get every machine working end to end
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search facility, FR code, equipment or AE title..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <SearchableSelect
              label=""
              compact
              className="w-48"
              value={readiness}
              onChange={(value) => {
                setReadiness(value);
                setPage(1);
              }}
              placeholder="All readiness"
              options={availableFilters?.readiness ?? READINESS_OPTIONS}
            />
            <SearchableSelect
              label=""
              compact
              className="w-48"
              value={ownership}
              onChange={(value) => {
                setOwnership(value);
                setPage(1);
              }}
              placeholder="All ownership"
              options={OWNERSHIP_OPTIONS}
            />
            <KephLevelFilter
              value={kephLevel}
              onChange={(value) => {
                setKephLevel(value);
                setPage(1);
              }}
              options={availableFilters?.keph_level}
              className="w-48"
            />
            {!!availableFilters?.county?.length && (
              <SearchableSelect
                label=""
                compact
                className="w-48"
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
            {!!availableFilters?.vendor?.length && (
              <SearchableSelect
                label=""
                compact
                className="w-48"
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
          </div>
        </div>

        {/* Readiness split */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            compact
            title="Facilities"
            mainValue={(summary?.total ?? 0).toLocaleString()}
            subtitle="Matching these filters"
            className="border border-slate-200"
          />
          {(["ready", "attention", "not_ready"] as ReadinessLevel[]).map(
            (level) => (
              <StatCard
                key={level}
                compact
                title={READINESS_LABELS[level]}
                mainValue={(summary?.by_readiness?.[level] ?? 0).toLocaleString()}
                subtitle="Equipment"
                onClick={() => {
                  setReadiness(readiness === level ? "" : level);
                  setPage(1);
                }}
                className={`border ${
                  readiness === level
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-200"
                }`}
              />
            ),
          )}
        </div>

        {/* Where the estate stands on each check. The gap between "live" and
            "worklist" is the one worth acting on. */}
        {summary?.by_check && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 pb-2 border-b border-slate-100">
              Evidence across the estate
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {READINESS_CHECKS.map((check) => (
                <div key={check.key} title={check.hint}>
                  <p className="text-xl font-bold text-slate-900">
                    {(summary.by_check?.[check.key] ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">{check.label}</p>
                  <p className="text-[11px] text-slate-400">{check.hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-20 bg-white rounded-lg border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : facilities.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">
              No facilities match these filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {facilities.map((row) => (
              <FacilityCard key={row.facility.id} row={row} />
            ))}
          </div>
        )}

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

        <button
          onClick={() => router.push("/facilities/ranking")}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          See facilities ranked by booking volume →
        </button>
      </div>
    </div>
  );
}

export default function FacilityReadinessPage() {
  return (
    <PermissionGate permission={Permission.VIEW_EQUIPMENT_STATUS}>
      <FacilityReadinessContent />
    </PermissionGate>
  );
}
