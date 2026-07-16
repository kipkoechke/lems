"use client";

import { useMemo, useState } from "react";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useShaInterventions } from "@/features/sha/useSha";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaShieldAlt, FaLayerGroup, FaStethoscope } from "react-icons/fa";

const formatAmount = (value?: number | string | null) =>
  value === null || value === undefined || value === ""
    ? "-"
    : Number(value).toLocaleString();

function ShaInterventionsContent() {
  const { lots, isLoading, error, refetch } = useShaInterventions();
  const [search, setSearch] = useState("");

  // Filter services within each lot, dropping lots left with no matches.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return lots;

    return lots
      .map((group) => ({
        ...group,
        services: group.services.filter(
          (s) =>
            s.name?.toLowerCase().includes(term) ||
            s.code?.toLowerCase().includes(term),
        ),
      }))
      .filter(
        (group) =>
          group.services.length > 0 ||
          group.lot.name?.toLowerCase().includes(term) ||
          group.lot.number?.toLowerCase().includes(term),
      );
  }, [lots, search]);

  const totalServices = lots.reduce((sum, g) => sum + g.services.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(4)].map((_, i) => (
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
        title="Unable to Load Interventions"
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
                <FaShieldAlt className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  SHA Interventions
                </h1>
                <p className="text-sm text-slate-500">
                  {totalServices} active services across {lots.length} lots
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search interventions by name, code or lot..."
              />
            </div>
          </div>
        </div>

        {/* Lots */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
              <FaStethoscope className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {search
                ? "No interventions match your search"
                : "No active interventions available."}
            </p>
          </div>
        ) : (
          filtered.map((group) => (
            <div
              key={group.lot.id ?? group.lot.number ?? group.lot.name}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <FaLayerGroup className="w-3.5 h-3.5 text-blue-600" />
                  {group.lot.number && (
                    <span className="text-sm font-medium text-slate-900">
                      LOT {group.lot.number}
                    </span>
                  )}
                  {group.lot.number && group.lot.name && (
                    <span className="text-slate-400">•</span>
                  )}
                  <span className="text-sm text-slate-600">
                    {group.lot.name || "Unnamed lot"}
                  </span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {group.services.length} services
                </span>
              </div>

              <div className="overflow-x-auto">
                <Table className="w-full">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Intervention</Table.HeaderCell>
                      <Table.HeaderCell>Code</Table.HeaderCell>
                      <Table.HeaderCell>Tariff</Table.HeaderCell>
                      <Table.HeaderCell>Vendor Share</Table.HeaderCell>
                      <Table.HeaderCell>Facility Share</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {group.services.length === 0 ? (
                      <Table.Empty colSpan={5}>
                        No services in this lot.
                      </Table.Empty>
                    ) : (
                      group.services.map((s) => (
                        <Table.Row key={s.id ?? s.code}>
                          <Table.Cell>
                            <div className="font-medium text-slate-900">
                              {s.name}
                            </div>
                            {s.capitated && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 mt-1">
                                Capitated
                              </span>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {s.code}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm font-medium text-slate-900">
                              {formatAmount(s.tariff)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-700">
                              {formatAmount(s.vendor_share)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="text-sm text-slate-700">
                              {formatAmount(s.facility_share)}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ShaInterventionsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_SHA_INTERVENTIONS}>
      <ShaInterventionsContent />
    </PermissionGate>
  );
}
