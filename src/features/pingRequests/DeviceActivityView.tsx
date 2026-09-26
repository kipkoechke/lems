"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaExchangeAlt,
  FaPlug,
  FaListUl,
  FaUpload,
  FaLink,
  FaUnlink,
} from "react-icons/fa";
import { Table } from "@/components/Table";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { SearchField } from "@/components/common/SearchField";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useDeviceActivity } from "./useDeviceActivity";
import {
  ACTIVITY_TYPES,
  PERIOD_PRESETS,
  type DeviceActivity,
  type DeviceActivityType,
  type PeriodPreset,
} from "@/services/apiPingRequests";

const LINKED_OPTIONS = [
  { value: "true", label: "Matched to equipment" },
  { value: "false", label: "Unmatched" },
];

const ACTIVITY_STYLE: Record<
  DeviceActivityType,
  { icon: React.ReactNode; cls: string; label: string }
> = {
  connect: {
    icon: <FaPlug className="w-3 h-3" />,
    cls: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Connect",
  },
  worklist_pull: {
    icon: <FaListUl className="w-3 h-3" />,
    cls: "bg-violet-50 text-violet-700 border-violet-200",
    label: "Worklist Pull",
  },
  study_send: {
    icon: <FaUpload className="w-3 h-3" />,
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Study Send",
  },
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-";

/**
 * The device activity log.
 *
 * This is an arrival log, not an approval queue: it records what each device
 * announced itself as, in the order it arrived. A row with no equipment is
 * normal — the device sent a name that matches nothing on file — and is the
 * quickest way to spot a misconfigured AE title.
 */
export default function DeviceActivityView() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [activityType, setActivityType] = useState("");
  const [period, setPeriod] = useState("");
  const [linked, setLinked] = useState("");
  const search = useSearchControl(() => setPage(1));

  const {
    activity,
    summary,
    pagination,
    availableFilters,
    isLoading,
    error,
    refetch,
  } = useDeviceActivity({
    page,
    page_size: 50,
    source_name: search.term || undefined,
    activity_type: (activityType || undefined) as
      | DeviceActivityType
      | undefined,
    period: (period || undefined) as PeriodPreset | undefined,
    // Tri-state — "" means no filter at all, not false.
    linked: linked === "" ? undefined : linked === "true",
  });

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Device Activity"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <FaExchangeAlt className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Device Activity
              </h2>
              <p className="text-sm text-slate-500">
                {(summary?.total ?? pagination?.total ?? activity.length
                ).toLocaleString()}{" "}
                events from {summary?.devices ?? 0} device
                {summary?.devices === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl w-full mx-auto">
            <SearchField
              value={search.input}
              onChange={search.onInputChange}
              onSearch={search.submit}
              onClear={search.clear}
              placeholder="Search by the name the device sent..."
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
        </div>
      </div>

      {/* The counters describe the filtered set, not the whole table, so they
          move with the controls above. */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">Events</p>
            <p className="text-lg font-bold text-slate-900">
              {summary.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">Known devices</p>
            <p className="text-lg font-bold text-emerald-600">
              {summary.linked.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">Unknown devices</p>
            <p className="text-lg font-bold text-amber-600">
              {summary.unlinked.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">Last arrival</p>
            <p className="text-sm font-medium text-slate-900">
              {formatDateTime(summary.latest_at)}
            </p>
          </div>
        </div>
      )}

      {/* Every activity type is listed, including the ones nothing arrived as,
          so the legend keeps its shape. */}
      {!!summary?.by_type?.length && (
        <div className="flex flex-wrap gap-2">
          {summary.by_type.map((type) => {
            const style = ACTIVITY_STYLE[type.value as DeviceActivityType];
            const active = activityType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => {
                  setActivityType(active ? "" : type.value);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  style?.cls ?? "bg-slate-50 text-slate-700 border-slate-200"
                } ${active ? "ring-2 ring-blue-400" : "hover:opacity-80"}`}
              >
                {style?.icon}
                {type.label}
                <span className="font-bold">
                  {type.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <ColumnFilter
                    label="Event"
                    options={availableFilters?.activity_type ?? ACTIVITY_TYPES}
                    value={activityType}
                    onChange={(value) => {
                      setActivityType(value);
                      setPage(1);
                    }}
                    allLabel="All Events"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Announced As</Table.HeaderCell>
                <Table.HeaderCell>Address</Table.HeaderCell>
                <Table.HeaderCell>
                  <ColumnFilter
                    label="Equipment"
                    options={availableFilters?.linked ?? LINKED_OPTIONS}
                    value={linked}
                    onChange={(value) => {
                      setLinked(value);
                      setPage(1);
                    }}
                    allLabel="All Devices"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>When</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Loading colSpan={6} rows={8} />
              ) : activity.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {search.term || activityType || period || linked
                    ? "No activity matches these filters."
                    : "No device activity recorded yet."}
                </Table.Empty>
              ) : (
                activity.map((event: DeviceActivity) => {
                  const style = ACTIVITY_STYLE[event.activity_type];
                  return (
                    <Table.Row
                      key={event.id}
                      onClick={
                        event.equipment
                          ? () => router.push(`/equipments/${event.equipment!.id}`)
                          : undefined
                      }
                    >
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                            style?.cls ??
                            "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {style?.icon}
                          {style?.label ?? event.activity_type}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {event.source_name}
                        </span>
                        {event.device_name &&
                          event.device_name !== event.source_name && (
                            <div className="text-xs text-slate-500 mt-1">
                              {event.device_name}
                            </div>
                          )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-mono text-xs text-slate-600">
                          {event.ip_addr || "-"}
                          {event.port ? `:${event.port}` : ""}
                        </span>
                        {event.modality && (
                          <div className="text-xs text-slate-400">
                            {event.modality}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {event.equipment ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                              <FaLink className="w-3 h-3" />
                              {event.equipment.name || event.equipment.code}
                            </span>
                            {event.equipment.code && (
                              <div className="text-xs text-slate-400 font-mono">
                                {event.equipment.code}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400"
                            title="The name this device sent matches no equipment on file"
                          >
                            <FaUnlink className="w-3 h-3" /> Unmatched
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {event.facility?.name || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(event.occurred_at)}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
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
  );
}
