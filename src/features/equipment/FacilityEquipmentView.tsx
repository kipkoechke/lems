"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCog,
  FaPlus,
  FaBuilding,
  FaTruck,
  FaCircle,
  FaCheckCircle,
  FaWrench,
} from "react-icons/fa";
import { Table } from "@/components/Table";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import StatCard from "@/components/common/StatCard";
import { useSearchControl } from "@/hooks/useSearchControl";
import { useCurrentFacility } from "@/hooks/useAuth";
import { useHasPermission } from "@/hooks/usePermissions";
import { Permission } from "@/lib/rbac";
import { useFacilityEquipments } from "./useFacilityEquipments";
import AddFacilityEquipmentModal from "./AddFacilityEquipmentModal";
import {
  facilityEquipmentStatusClasses,
  type FacilityEquipmentListItem,
  type FacilityEquipmentOwnership,
} from "@/services/apiFacilityEquipment";

const OWNERSHIP_OPTIONS = [
  { value: "facility", label: "Owned by facility" },
  { value: "vendor", label: "Vendor supplied" },
];

/**
 * `linked` and `is_connected` answer different questions: `linked` is "has
 * this device ever been seen on the network", `is_connected` is "is it
 * connected right now". The filter is on the former, the badge on the latter.
 */
const LINKED_OPTIONS = [
  { value: "true", label: "Seen on the network" },
  { value: "false", label: "Never seen" },
];

const label = (value?: string | null) =>
  value ? value.replace(/_/g, " ") : "-";

/**
 * Equipment page for facility roles.
 *
 * Reads `/facility/equipments`, which resolves the facility from the auth
 * token and returns both owned and vendor-mapped units. The admin listing
 * (`/admin/equipment`) and `/equipment/{id}` are admin/nesp/moh/cog only.
 */
export default function FacilityEquipmentView() {
  const router = useRouter();
  const facility = useCurrentFacility();
  const canAddEquipment = useHasPermission(
    Permission.MANAGE_FACILITY_EQUIPMENT,
  );

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [modality, setModality] = useState("");
  const [category, setCategory] = useState("");
  const [ownership, setOwnership] = useState("");
  const [linked, setLinked] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const search = useSearchControl(() => setPage(1));

  const {
    equipments,
    summary,
    pagination,
    availableFilters,
    isLoading,
    error,
    refetch,
  } = useFacilityEquipments({
    page,
    per_page: 20,
    search: search.term || undefined,
    status: status || undefined,
    modality: modality || undefined,
    category: category || undefined,
    ownership_type: (ownership || undefined) as
      | FacilityEquipmentOwnership
      | undefined,
    // Tri-state — "" means no filter, not false.
    linked: linked === "" ? undefined : linked === "true",
  });

  // The summary is a status map plus a total; render the statuses the API
  // actually reports rather than a fixed list.
  const statusTiles = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary)
      .filter(([key]) => key !== "total")
      .map(([key, value]) => ({ key, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  const statusOptions =
    availableFilters?.status?.length
      ? availableFilters.status
      : statusTiles.map((tile) => ({ value: tile.key, label: label(tile.key) }));

  const modalityOptions =
    availableFilters?.modality?.map((m) => ({
      value: m.code,
      label: m.label,
    })) ?? [];

  if (error) {
    const httpStatus = (error as { response?: { status?: number } })?.response
      ?.status;
    if (httpStatus === 403) {
      return (
        <div className="min-h-screen p-4">
          <div className="max-w-5xl mx-auto bg-white rounded-lg border border-slate-200 p-8 text-center">
            <FaCog className="w-6 h-6 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              Your account is not linked to a facility, so no equipment can be
              listed.
            </p>
          </div>
        </div>
      );
    }

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
                  {summary?.total ?? equipments.length} unit
                  {(summary?.total ?? equipments.length) === 1 ? "" : "s"} at{" "}
                  {facility?.name || "your facility"}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
                placeholder="Search by name, code, AE title, serial number..."
              />
            </div>

            {canAddEquipment && (
              <button
                onClick={() => setShowAdd(true)}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <FaPlus className="w-3 h-3" /> Add Equipment
              </button>
            )}
          </div>
        </div>

        {/* Status summary */}
        {statusTiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              compact
              title="All Equipment"
              mainValue={summary?.total ?? 0}
              subtitle="Owned + vendor"
              className={`border ${
                status ? "border-slate-200" : "border-blue-500 ring-1 ring-blue-500"
              }`}
              onClick={() => {
                setStatus("");
                setPage(1);
              }}
            />
            {statusTiles.map((tile) => (
              <StatCard
                key={tile.key}
                compact
                title={label(tile.key)}
                mainValue={tile.value}
                className={`border capitalize ${
                  status === tile.key
                    ? "border-blue-500 ring-1 ring-blue-500"
                    : "border-slate-200"
                }`}
                onClick={() => {
                  setStatus(status === tile.key ? "" : tile.key);
                  setPage(1);
                }}
              />
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Code</Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Modality"
                      options={modalityOptions}
                      value={modality}
                      onChange={(v) => {
                        setModality(v);
                        setPage(1);
                      }}
                      allLabel="All Modalities"
                      searchPlaceholder="Search modality..."
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Ownership"
                      options={OWNERSHIP_OPTIONS}
                      value={ownership}
                      onChange={(v) => {
                        setOwnership(v);
                        setPage(1);
                      }}
                      allLabel="All Equipment"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Category"
                      options={availableFilters?.category ?? []}
                      value={category}
                      onChange={(v) => {
                        setCategory(v);
                        setPage(1);
                      }}
                      allLabel="All Categories"
                      searchPlaceholder="Search category..."
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Services</Table.HeaderCell>
                  <Table.HeaderCell>
                  <ColumnFilter
                    label="Connection"
                    options={availableFilters?.linked ?? LINKED_OPTIONS}
                    value={linked}
                    onChange={(v) => {
                      setLinked(v);
                      setPage(1);
                    }}
                    allLabel="All Devices"
                    searchable={false}
                  />
                </Table.HeaderCell>
                  <Table.HeaderCell>
                    <ColumnFilter
                      label="Status"
                      options={statusOptions}
                      value={status}
                      onChange={(v) => {
                        setStatus(v);
                        setPage(1);
                      }}
                      allLabel="All Status"
                      searchable={false}
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {isLoading ? (
                  <Table.Loading colSpan={8} rows={6} />
                ) : equipments.length === 0 ? (
                  <Table.Empty colSpan={8}>
                    {search.term ||
                    status ||
                    modality ||
                    ownership ||
                    linked ||
                    category
                      ? "No equipment matches these filters."
                      : "No equipment at this facility yet."}
                  </Table.Empty>
                ) : (
                  equipments.map((equipment: FacilityEquipmentListItem) => (
                    <Table.Row
                      key={equipment.id}
                      onClick={() =>
                        router.push(`/equipments/${equipment.id}`)
                      }
                    >
                      <Table.Cell>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {equipment.code}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="font-medium text-slate-900">
                          {equipment.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {[equipment.brand, equipment.model]
                            .filter(Boolean)
                            .join(" ") ||
                            equipment.category_label ||
                            label(equipment.category)}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{equipment.modality || "-"}</Table.Cell>
                      <Table.Cell>
                        {equipment.ownership_type === "vendor" ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-violet-50 text-violet-700 border-violet-200">
                              <FaTruck className="w-3 h-3" /> Vendor
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              {equipment.vendor?.name || "-"}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-sky-50 text-sky-700 border-sky-200">
                            <FaBuilding className="w-3 h-3" /> Facility
                          </span>
                        )}
                      </Table.Cell>
                        <Table.Cell>
                        {equipment.category_label || label(equipment.category)}
                      </Table.Cell>
                      <Table.Cell>
                        {equipment.mapped_services_count ??
                          equipment.mapped_services?.length ??
                          0}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            equipment.is_connected
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          <FaCircle
                            className={`w-2 h-2 ${
                              equipment.is_connected
                                ? "text-emerald-500"
                                : "text-slate-300"
                            }`}
                          />
                          {equipment.is_connected ? "Online" : "Offline"}
                        </span>
                        {/* Never seen at all is a different problem from
                            being offline right now — say which. */}
                        {equipment.linked === false && (
                          <div className="text-xs text-slate-400">
                            Awaiting first contact
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${facilityEquipmentStatusClasses(
                            equipment,
                          )}`}
                        >
                          {equipment.status === "active" ? (
                            <FaCheckCircle className="w-3 h-3" />
                          ) : equipment.status === "maintenance" ? (
                            <FaWrench className="w-3 h-3" />
                          ) : null}
                          {equipment.status_label || label(equipment.status)}
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

      {showAdd && (
        <AddFacilityEquipmentModal onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
