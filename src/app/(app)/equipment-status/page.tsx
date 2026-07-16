"use client";

import { useState } from "react";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useEquipmentStatusLogs,
  useEquipmentStatusSummary,
} from "@/features/equipmentStatus/useEquipmentStatus";
import { Table } from "@/components/Table";
import Pagination from "@/components/common/Pagination";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { ErrorState } from "@/components/common/ErrorState";
import {
  FaHeartbeat,
  FaCheckCircle,
  FaWrench,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
  { value: "decommissioned", label: "Decommissioned" },
  { value: "pending_installation", label: "Pending Installation" },
];

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  pending_installation: "bg-blue-50 text-blue-700 border-blue-200",
};

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

function EquipmentStatusContent() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { logs, pagination, isLoading, error, refetch } =
    useEquipmentStatusLogs({
      page,
      per_page: 15,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
    });

  const { summary } = useEquipmentStatusSummary();

  const stats = [
    {
      label: "Total Equipment",
      value: summary?.total_equipment ?? 0,
      icon: FaHeartbeat,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Operational",
      value: summary?.operational ?? 0,
      icon: FaCheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Maintenance",
      value: summary?.maintenance ?? 0,
      icon: FaWrench,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Non-operational",
      value: summary?.non_operational ?? 0,
      icon: FaTimesCircle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      label: "Downtime (hrs)",
      value: summary?.total_downtime_hours ?? 0,
      icon: FaClock,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Equipment Status Logs"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 mb-2 md:mb-3 px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaHeartbeat className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Equipment Status
              </h1>
              <p className="text-sm text-slate-500">
                Status change history and uptime summary
              </p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 border-b border-slate-100">
            <div className="w-full sm:w-44">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="w-full sm:w-44">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Equipment</Table.HeaderCell>
                <Table.HeaderCell>
                  <ColumnFilter
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(v) => {
                      setStatus(v);
                      setPage(1);
                    }}
                    allLabel="All Status"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Notes</Table.HeaderCell>
                <Table.HeaderCell>Logged By</Table.HeaderCell>
                <Table.HeaderCell>When</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {logs.length === 0 ? (
                <Table.Empty colSpan={5}>
                  {status || from || to
                    ? "No status changes match your criteria"
                    : "No equipment status changes recorded yet."}
                </Table.Empty>
              ) : (
                logs.map((log) => (
                  <Table.Row key={log.id}>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">
                        {log.equipment?.name || "-"}
                      </div>
                      {log.equipment?.code && (
                        <div className="text-xs text-slate-500 font-mono">
                          {log.equipment.code}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${
                          STATUS_BADGE[log.status] ??
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {log.status_label || log.status?.replace(/_/g, " ")}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {log.notes || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {log.created_by?.name || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-600">
                        {formatDateTime(log.created_at)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>

          {pagination && pagination.last_page > 1 && (
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
      </div>
    </div>
  );
}

export default function EquipmentStatusPage() {
  return (
    <PermissionGate permission={Permission.VIEW_EQUIPMENT_STATUS}>
      <EquipmentStatusContent />
    </PermissionGate>
  );
}
