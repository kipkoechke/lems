"use client";

import { useRouter } from "next/navigation";
import {
  FaBuilding,
  FaTruck,
  FaCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import BackButton from "@/components/common/BackButton";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";
import { DashboardSkeleton } from "@/components/common/Skeleton";
import { useFacilityEquipment } from "./useFacilityEquipments";
import { facilityEquipmentStatusClasses } from "@/services/apiFacilityEquipment";
import EquipmentWorklistTests from "./EquipmentWorklistTests";
import { ConnectivityBadges } from "@/components/common/ConnectivityBadges";

const label = (value?: string | null) =>
  value ? String(value).replace(/_/g, " ") : "-";

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

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatMinutes = (minutes?: number | null) => {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

/** Equipment detail for facility roles, from `/facility/equipments/{id}`. */
export default function FacilityEquipmentDetail({ id }: { id: string }) {
  const router = useRouter();
  const { equipment, isLoading, error, refetch } = useFacilityEquipment(id);

  if (isLoading) {
    return <DashboardSkeleton stats={4} panels={2} />;
  }

  if (error || !equipment) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    return (
      <ErrorState
        title={
          status === 404
            ? "Equipment Not Found"
            : status === 403
              ? "No Facility Linked"
              : "Unable to Load Equipment"
        }
        error={
          status === 404
            ? new Error("This equipment is not visible to your facility.")
            : (error as Error)
        }
        action={{ label: "Go Back", onClick: () => router.back() }}
        fullScreen
      />
    );
  }

  const dicom = equipment.dicom;
  const identity: { label: string; value?: string | null }[] = [
    { label: "Code", value: equipment.code },
    { label: "Serial Number", value: equipment.serial_number },
    { label: "Model", value: equipment.model },
    { label: "Brand", value: equipment.brand },
    { label: "Category", value: equipment.category_label || equipment.category },
    { label: "Modality", value: equipment.modality },
    { label: "Manufacture Date", value: formatDate(equipment.manufacture_date) },
    // Reported by the device itself on every study, so these stay true even
    // when nothing useful was typed in at registration.
    { label: "Station Name", value: equipment.station_name },
    { label: "Software Version", value: equipment.software_version },
  ];

  const connection: { label: string; value?: string | null }[] = [
    { label: "AE Title", value: dicom?.ae_title ?? equipment.ae_title },
    { label: "Calling AE Title", value: dicom?.calling_ae_title },
    // Learned from the device's own traffic, so a new unit has none yet.
    { label: "Host", value: dicom?.host || "Awaiting first contact" },
    // Only worth showing when it differs: that means the machine is behind a
    // shared address and a C-ECHO to it would stop at the site boundary.
    ...(dicom?.reported_ip && dicom.reported_ip !== dicom.host
      ? [{ label: "Contacts From (shared)", value: dicom.reported_ip }]
      : []),
    { label: "DICOM Port", value: dicom?.dicom_port?.toString() },
    { label: "HL7 Port", value: dicom?.hl7_port?.toString() },
    { label: "Last Seen", value: formatDateTime(dicom?.last_seen_at) },
    { label: "Connected Since", value: formatDateTime(dicom?.connected_at) },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {equipment.name}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{equipment.code}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {equipment.ownership_type === "vendor" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-violet-50 text-violet-700 border-violet-200">
                <FaTruck className="w-3 h-3" />
                {equipment.vendor?.name || "Vendor supplied"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-sky-50 text-sky-700 border-sky-200">
                <FaBuilding className="w-3 h-3" /> Facility owned
              </span>
            )}
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border capitalize ${facilityEquipmentStatusClasses(
                equipment,
              )}`}
            >
              {equipment.status_label || label(equipment.status)}
            </span>
            <ConnectivityBadges
              isConnected={dicom?.is_connected ?? equipment.is_connected}
              linked={dicom?.linked ?? equipment.linked}
              lastSeenAt={dicom?.last_seen_at ?? equipment.last_seen_at}
            />
          </div>
        </div>

        {/* Active downtime */}
        {equipment.is_currently_down && equipment.active_downtime && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-3">
            <FaExclamationTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold">
                Down since {formatDateTime(equipment.active_downtime.started_at)}
              </p>
              <p>
                {equipment.active_downtime.reason || "No reason recorded"}
                {equipment.active_downtime.notes
                  ? ` — ${equipment.active_downtime.notes}`
                  : ""}
              </p>
            </div>
          </div>
        )}

        {/* Identity */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Equipment Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {identity.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {label(item.value) || "-"}
                </p>
              </div>
            ))}
          </div>

          {equipment.description && (
            <p className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
              {equipment.description}
            </p>
          )}

          {equipment.specifications &&
            Object.keys(equipment.specifications).length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-700 mb-2">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                  {Object.entries(equipment.specifications).map(
                    ([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-slate-500">{label(key)}</p>
                        <p className="text-sm text-slate-900">
                          {String(value)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Connectivity */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Connectivity
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                dicom?.is_connected ?? equipment.is_connected
                  ? "text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              <FaCircle
                className={`w-2 h-2 ${
                  dicom?.is_connected ?? equipment.is_connected
                    ? "text-emerald-500"
                    : "text-slate-300"
                }`}
              />
              {dicom?.is_connected ?? equipment.is_connected
                ? "Online"
                : "Offline"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {connection.map((item) => (
              <div key={item.label}>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-slate-900">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>
              Registered in Orthanc: {dicom?.linked ? "Yes" : "No"}
            </span>
            <span>
              Total downtime:{" "}
              {formatMinutes(equipment.total_downtime_minutes ?? null)}
            </span>
          </div>
        </div>

        {/* Mapped services */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">
              Services ({equipment.mapped_services_count ??
                equipment.mapped_services?.length ??
                0}
              )
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Code</Table.HeaderCell>
                  <Table.HeaderCell>Service</Table.HeaderCell>
                  <Table.HeaderCell>Lot</Table.HeaderCell>
                  <Table.HeaderCell>Tariff</Table.HeaderCell>
                  <Table.HeaderCell>Active</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(equipment.mapped_services ?? []).length === 0 ? (
                  <Table.Empty colSpan={5}>
                    No services mapped to this unit
                  </Table.Empty>
                ) : (
                  equipment.mapped_services!.map((service) => (
                    <Table.Row key={service.contract_service_id}>
                      <Table.Cell>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {service.code}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{service.name}</Table.Cell>
                      <Table.Cell>
                        {service.lot
                          ? `LOT ${service.lot.number} — ${service.lot.name}`
                          : "-"}
                      </Table.Cell>
                      <Table.Cell>
                        {Number(service.tariff ?? 0).toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                          maximumFractionDigits: 0,
                        })}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                            service.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Status history */}
        {(equipment.status_history ?? []).length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Recent Status Changes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Started</Table.HeaderCell>
                    <Table.HeaderCell>Ended</Table.HeaderCell>
                    <Table.HeaderCell>Downtime</Table.HeaderCell>
                    <Table.HeaderCell>Reason</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {equipment.status_history!.map((entry) => (
                    <Table.Row key={entry.id}>
                      <Table.Cell>
                        <span className="capitalize">{label(entry.status)}</span>
                      </Table.Cell>
                      <Table.Cell>{formatDateTime(entry.started_at)}</Table.Cell>
                      <Table.Cell>
                        {entry.ended_at ? formatDateTime(entry.ended_at) : "Ongoing"}
                      </Table.Cell>
                      <Table.Cell>
                        {entry.formatted_downtime ||
                          formatMinutes(entry.downtime_minutes)}
                      </Table.Cell>
                      <Table.Cell>
                        <div>{entry.reason || "-"}</div>
                        {entry.notes && (
                          <div className="text-xs text-slate-500">
                            {entry.notes}
                          </div>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}

        {/* Testing history — carried by the detail payload itself. */}
        <EquipmentWorklistTests tests={equipment.worklist_tests} />

        <button
          onClick={() => refetch()}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
