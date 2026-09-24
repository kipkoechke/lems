"use client";

import { useState } from "react";
import {
  FaXRay,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useSearchControl } from "@/hooks/useSearchControl";
import {
  useUnmatchedStudies,
  useUnmatchedStudiesScope,
} from "@/features/studies/useUnmatchedStudies";
import { PERIOD_PRESETS } from "@/services/apiPingRequests";
import type { UnmatchedStudy } from "@/services/apiUnmatchedStudies";

const ATTRIBUTION_OPTIONS = [
  { value: "true", label: "Matched to a machine" },
  { value: "false", label: "Unattributed" },
];

/** Manufacturer and station, as one line when either is present. */
const station = (study: UnmatchedStudy) =>
  [study.manufacturer, study.station_name].filter(Boolean).join(" ");

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/**
 * Non-SHA studies.
 *
 * Studies that reached Orthanc with no VEMS order behind them — walk-ins,
 * private patients, machines used outside the SHA workflow. They used to be
 * rejected on arrival and lost; they are now kept and attributed to the
 * machine that reported them.
 *
 * The scope follows the role: an admin sees everything including the studies
 * that matched no machine at all, a vendor sees its own machines, a facility
 * sees the machines it owns or has mapped to it.
 */
export default function UnmatchedStudiesPage() {
  const scope = useUnmatchedStudiesScope();

  const [page, setPage] = useState(1);
  const [attributed, setAttributed] = useState("");
  const [period, setPeriod] = useState("");
  const [modality, setModality] = useState("");
  const search = useSearchControl(() => setPage(1));

  const { studies, summary, pagination, isLoading, error, refetch } =
    useUnmatchedStudies(scope, {
      page,
      page_size: 25,
      search: search.term || undefined,
      period: period || undefined,
      modality: modality || undefined,
      // Tri-state — "" means no filter, not false.
      attributed: attributed === "" ? undefined : attributed === "true",
    });

  // The listing has no modality filter options of its own, so they are taken
  // from what has actually arrived.
  const modalityOptions = Array.from(
    new Set(studies.map((study) => study.modality).filter(Boolean)),
  ).map((value) => ({ value: value as string, label: value as string }));

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Studies"
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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaXRay className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Non-SHA Studies
                </h1>
                <p className="text-sm text-slate-500">
                  Studies that arrived with no VEMS order behind them
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search accession, study UID, patient, station or AE title..."
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
              options={PERIOD_PRESETS}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            compact
            title="Total"
            mainValue={(summary?.total ?? 0).toLocaleString()}
            subtitle="Studies with no order"
            className="border border-slate-200"
          >
            <FaXRay className="w-4 h-4 text-purple-500" />
          </StatCard>
          <StatCard
            compact
            title="This Month"
            mainValue={(summary?.this_month ?? 0).toLocaleString()}
            className="border border-slate-200"
          >
            <FaCalendarAlt className="w-4 h-4 text-blue-500" />
          </StatCard>
          <StatCard
            compact
            title="Unattributed"
            mainValue={(summary?.unattributed ?? 0).toLocaleString()}
            subtitle="No machine matched"
            className="border border-slate-200"
          >
            <FaExclamationTriangle className="w-4 h-4 text-amber-500" />
          </StatCard>
          <StatCard
            compact
            title="Latest"
            mainValue={
              summary?.latest_received_at
                ? formatDateTime(summary.latest_received_at)
                : "-"
            }
            subtitle="Most recent arrival"
            className="border border-slate-200"
          >
            <FaCheckCircle className="w-4 h-4 text-emerald-500" />
          </StatCard>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Patient / Accession</Table.HeaderCell>
                  <Table.HeaderCell>Study</Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Modality"
                      options={modalityOptions}
                      value={modality}
                      onChange={(value) => {
                        setModality(value);
                        setPage(1);
                      }}
                      allLabel="All Modalities"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Equipment"
                      options={ATTRIBUTION_OPTIONS}
                      value={attributed}
                      onChange={(value) => {
                        setAttributed(value);
                        setPage(1);
                      }}
                      allLabel="All Studies"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell align="right">Received</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Loading colSpan={5} rows={8} />
                ) : studies.length === 0 ? (
                  <Table.Empty colSpan={5}>
                    {search.term || period || modality || attributed
                      ? "No studies match these filters."
                      : "No studies have arrived without an order."}
                  </Table.Empty>
                ) : (
                  studies.map((study: UnmatchedStudy) => (
                    <Table.Row key={study.id}>
                      {/* Patient and accession are what a study is looked up
                          by, so they lead. The study UID identifies nothing to
                          a human and is on the title instead. */}
                      <Table.Cell>
                        <div className="font-mono text-sm text-slate-800">
                          {study.patient_id || "Unknown patient"}
                        </div>
                        <div
                          className="font-mono text-[11px] text-slate-500"
                          title={study.study_instance_uid || undefined}
                        >
                          {study.accession_number || (
                            <span
                              className="text-slate-400"
                              title="The machine sent no accession number, so the study is filed under its study UID"
                            >
                              No accession
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                      {/* Description and body part describe the same thing and
                          are rarely both present — DX sends a body part and no
                          description, US the reverse — so one column carries
                          whichever arrived, with the other beside it. */}
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">
                            {study.study_description || study.body_part || "-"}
                          </span>
                          {study.study_description && study.body_part && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                              {study.body_part}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {[
                            study.institution_name,
                            study.series_count != null ||
                            study.instance_count != null
                              ? `${study.series_count ?? "-"} series · ${
                                  study.instance_count ?? "-"
                                } images`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {study.modality || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {study.attributed && study.equipment ? (
                          <div>
                            <span className="text-sm text-slate-800">
                              {study.equipment.name || study.equipment.code}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {[
                                station(study),
                                study.vendor?.name,
                                study.facility?.name,
                              ]
                                .filter(Boolean)
                                .join(" · ") ||
                                study.equipment.ae_title ||
                                ""}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200"
                              title="The AE title on this study matches no equipment on file"
                            >
                              <FaExclamationTriangle className="w-3 h-3" />
                              Unattributed
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {[
                                study.source_ae_title
                                  ? `sent as ${study.source_ae_title}`
                                  : null,
                                station(study),
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          </div>
                        )}
                      </Table.Cell>
                      {/* Timings are reference, not what the row is scanned
                          for, so they sit last and right-aligned. */}
                      <Table.Cell align="right">
                        <div className="text-xs text-slate-600">
                          {formatDateTime(study.received_at)}
                        </div>
                        {study.performed_at && (
                          <div
                            className="text-[11px] text-slate-400"
                            title="When the study was acquired, which need not be the day it arrived"
                          >
                            acquired {formatDateTime(study.performed_at)}
                          </div>
                        )}
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
