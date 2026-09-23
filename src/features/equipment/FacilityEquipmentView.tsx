"use client";

import { useMemo, useState } from "react";
import { FaCog, FaCheckCircle, FaWrench, FaTimesCircle } from "react-icons/fa";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { useCurrentFacility } from "@/hooks/useAuth";
import { useFacilityEquipment } from "./useFacilityEquipment";
import {
  facilityEquipmentId,
  facilityEquipmentStatus,
  type FacilityOperationalEquipment,
} from "@/services/apiEquipment";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  operational: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  pending_installation: "bg-blue-50 text-blue-700 border-blue-200",
};

const statusIcon = (status: string) => {
  switch (status) {
    case "active":
    case "operational":
      return <FaCheckCircle className="w-3 h-3" />;
    case "maintenance":
      return <FaWrench className="w-3 h-3" />;
    case "decommissioned":
      return <FaTimesCircle className="w-3 h-3" />;
    default:
      return null;
  }
};

const label = (value?: string | null) =>
  value ? value.replace(/_/g, " ") : "-";

/**
 * Equipment page for facility roles.
 *
 * Reads `/equipment/facility/{facility}/operational`, the only equipment
 * listing the API reference grants to `f_admin`, `f_practitioner` and
 * `f_equipment_user`. The admin listing and the `/equipment/{id}` detail route
 * are admin/nesp/moh/cog only, so no row links out to the detail page.
 */
export default function FacilityEquipmentView() {
  const facility = useCurrentFacility();
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { equipments, isLoading, error, refetch } = useFacilityEquipment(
    facility?.id,
  );

  // The endpoint takes no query params, so filtering is local to the list it
  // returns — which is the facility's whole inventory, not a page of it.
  const filtered = useMemo(() => {
    const term = submittedTerm.trim().toLowerCase();
    if (!term) return equipments;
    return equipments.filter((equipment) =>
      [
        equipment.name,
        equipment.asset_id,
        equipment.code,
        equipment.serial_number,
        equipment.model,
        equipment.brand ?? equipment.manufacturer,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [equipments, submittedTerm]);

  const modalityCounts = useMemo(() => {
    const tally = new Map<string, number>();
    equipments.forEach((equipment) => {
      const key =
        equipment.modality ||
        equipment.category_label ||
        equipment.category ||
        "Unassigned";
      tally.set(key, (tally.get(key) ?? 0) + 1);
    });
    return Array.from(tally.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [equipments]);

  if (!facility?.id) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-5xl mx-auto bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-600">
            Your account is not linked to a facility, so no equipment can be
            listed.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Equipment"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCog className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Equipment</h1>
                <p className="text-sm text-slate-500">
                  {equipments.length} operational item
                  {equipments.length === 1 ? "" : "s"} at{" "}
                  {facility.name || "your facility"}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={() => setSubmittedTerm(searchTerm)}
                onClear={() => {
                  setSearchTerm("");
                  setSubmittedTerm("");
                }}
                placeholder="Search by name, asset ID, serial number..."
              />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {!isLoading && modalityCounts.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Deployed by modality
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                compact
                title="All Equipment"
                mainValue={equipments.length}
                subtitle="Operational"
                className="border border-slate-200"
              />
              {modalityCounts.map((modality) => (
                <StatCard
                  key={modality.name}
                  compact
                  title={label(modality.name)}
                  mainValue={modality.count}
                  className="border border-slate-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Asset ID</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Modality / Category</Table.HeaderCell>
                  <Table.HeaderCell>Procedures</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Loading colSpan={5} rows={5} />
                ) : filtered.length === 0 ? (
                  <Table.Empty colSpan={5}>
                    {submittedTerm
                      ? "No equipment matches your search."
                      : "No operational equipment at this facility."}
                  </Table.Empty>
                ) : (
                  filtered.map((equipment: FacilityOperationalEquipment) => {
                    const status = facilityEquipmentStatus(equipment);
                    return (
                      <Table.Row key={facilityEquipmentId(equipment)}>
                        <Table.Cell>
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                            {equipment.asset_id || equipment.code || "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="font-medium text-slate-900">
                            {equipment.name}
                          </div>
                          {(equipment.model ||
                            equipment.brand ||
                            equipment.manufacturer) && (
                            <div className="text-xs text-slate-500">
                              {[
                                equipment.brand ?? equipment.manufacturer,
                                equipment.model,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {label(
                            equipment.modality ||
                              equipment.category_label ||
                              equipment.category,
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {equipment.capable_procedures?.length ?? "-"}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${
                              STATUS_BADGE[status] ||
                              "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {statusIcon(status)}
                            {equipment.status_label || label(status)}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
