"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dicomConfigureSchema,
  DicomConfigureFormData,
} from "@/lib/validations";
import { FaBoxOpen, FaSave, FaTimes, FaInfoCircle } from "react-icons/fa";
import { Table } from "@/components/Table";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";
import { InputField } from "@/components/common/InputField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FacilityFilter } from "@/components/common/FacilityFilter";
import { useVendors } from "@/features/vendors/useVendors";
import { useConfigureEquipmentDicom } from "@/features/dicom/useDicom";
import { usePendingInstallation } from "./useDeviceActivity";
import type { PendingInstallationEquipment } from "@/services/apiPingRequests";

/** The port every discovered device is stamped with until someone verifies it. */
const PLACEHOLDER_PORT = 11112;

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
 * Claim a discovered device.
 *
 * Devices that appear on the network arrive unowned: no vendor, no facility,
 * status `pending_installation`. `POST /dicom/equipment/{id}/configure` is the
 * one route that assigns them and registers them with Orthanc, and it is also
 * the only way to correct a port — a DICOM association never advertises the
 * peer's listening port, so nothing can discover it.
 */
function ClaimDeviceModal({
  equipment,
  onClose,
}: {
  equipment: PendingInstallationEquipment;
  onClose: () => void;
}) {
  const { configureDicom, isConfiguring } = useConfigureEquipmentDicom();
  const { vendors, isLoading: vendorsLoading } = useVendors();

  const [vendorId, setVendorId] = useState(equipment.vendor?.id ?? "");
  const [facilityId, setFacilityId] = useState(equipment.facility?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DicomConfigureFormData>({
    resolver: zodResolver(dicomConfigureSchema),
  });

  useEffect(() => {
    reset({
      ae_title: equipment.ae_title ?? "",
      ip: equipment.hl7_host ?? equipment.discovered?.ip ?? "",
      port:
        equipment.dicom_port ??
        equipment.discovered?.port ??
        PLACEHOLDER_PORT,
    });
  }, [equipment, reset]);

  const onSubmit = (values: DicomConfigureFormData) => {
    configureDicom(
      {
        equipmentId: equipment.id,
        data: {
          ae_title: values.ae_title,
          ip: values.ip,
          port: Number(values.port),
          vendor_id: vendorId || undefined,
          facility_id: facilityId || undefined,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Install {equipment.name}
            </h2>
            <p className="text-sm text-slate-500 font-mono">{equipment.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-800">
            <FaInfoCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>
              Assigning the owner also registers the device with Orthanc. Check
              the port against the device itself — {PLACEHOLDER_PORT} is the
              placeholder every discovered device starts with, not a verified
              listening port.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="Vendor"
              options={vendors.map((vendor) => ({
                value: vendor.id,
                label: vendor.name,
                description: vendor.code,
              }))}
              value={vendorId}
              onChange={setVendorId}
              placeholder={vendorsLoading ? "Loading..." : "Leave unassigned"}
              searchPlaceholder="Search vendors..."
              isLoading={vendorsLoading}
            />

            <FacilityFilter
              value={facilityId}
              onChange={setFacilityId}
              placeholder="Leave unassigned"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="AE Title"
              type="text"
              placeholder="e.g. XRD01"
              register={register("ae_title")}
              error={errors.ae_title?.message}
              required
              disabled={isConfiguring}
            />

            <InputField
              label="Device Host / IP"
              type="text"
              placeholder="e.g. 10.0.0.9"
              register={register("ip")}
              error={errors.ip?.message}
              required
              disabled={isConfiguring}
            />

            <InputField
              label="DICOM Port"
              type="number"
              placeholder={String(PLACEHOLDER_PORT)}
              register={register("port")}
              error={errors.port?.message}
              required
              disabled={isConfiguring}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConfiguring}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave className="w-3.5 h-3.5" />
              {isConfiguring ? "Installing..." : "Install Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Equipment awaiting installation.
 *
 * Mostly devices that announced themselves on the network before anyone
 * registered them. They are created unowned rather than parked under a
 * placeholder vendor, so a null vendor or facility here is the normal state,
 * not missing data.
 */
export default function PendingInstallationView() {
  const [page, setPage] = useState(1);
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [claiming, setClaiming] =
    useState<PendingInstallationEquipment | null>(null);

  const { equipments, pagination, isLoading, error, refetch } =
    usePendingInstallation({
      page,
      page_size: 50,
      unassigned_only: unassignedOnly || undefined,
    });

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Pending Installations"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FaBoxOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pending Installation
              </h2>
              <p className="text-sm text-slate-500">
                {pagination?.total ?? equipments.length} device
                {(pagination?.total ?? equipments.length) === 1 ? "" : "s"}{" "}
                waiting to be assigned an owner
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 shrink-0">
            <input
              type="checkbox"
              checked={unassignedOnly}
              onChange={(event) => {
                setUnassignedOnly(event.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Unassigned only
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>AE Title</Table.HeaderCell>
                <Table.HeaderCell>Discovered At</Table.HeaderCell>
                <Table.HeaderCell>Vendor</Table.HeaderCell>
                <Table.HeaderCell>Facility</Table.HeaderCell>
                <Table.HeaderCell>Last Seen</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                <Table.Loading colSpan={8} rows={6} />
              ) : equipments.length === 0 ? (
                <Table.Empty colSpan={8}>
                  Nothing is waiting to be installed.
                </Table.Empty>
              ) : (
                equipments.map((equipment) => {
                  const host = equipment.hl7_host ?? equipment.discovered?.ip;
                  const port =
                    equipment.dicom_port ?? equipment.discovered?.port;
                  return (
                    <Table.Row key={equipment.id}>
                      <Table.Cell>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {equipment.code}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-slate-900">
                          {equipment.name}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-mono text-xs text-slate-600">
                          {equipment.ae_title || "-"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {host ? (
                          <span className="font-mono text-xs text-slate-600">
                            {host}
                            {port ? `:${port}` : ""}
                            {port === PLACEHOLDER_PORT && (
                              <span
                                className="ml-1 text-amber-600"
                                title="Placeholder port — confirm against the device"
                              >
                                ?
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Awaiting first contact
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {equipment.vendor ? (
                          <span className="text-sm text-slate-700">
                            {equipment.vendor.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {equipment.facility ? (
                          <span className="text-sm text-slate-700">
                            {equipment.facility.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Unassigned
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(equipment.last_seen_at)}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <button
                          onClick={() => setClaiming(equipment)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Install
                        </button>
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

      {claiming && (
        <ClaimDeviceModal
          equipment={claiming}
          onClose={() => {
            setClaiming(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
