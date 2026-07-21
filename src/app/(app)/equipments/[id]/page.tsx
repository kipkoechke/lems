"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  FaCog,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaBarcode,
  FaIndustry,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaInfoCircle,
  FaPlug,
  FaListAlt,
  FaTimes,
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import BackButton from "@/components/common/BackButton";
import {
  useDeleteEquipment,
  useEquipmentDetail,
} from "@/features/vendors/useEquipmentDetail";
import {
  useConfigureEquipmentDicom,
  useEquipmentDicomStatus,
  useRegisterEquipmentModality,
  useTestEquipmentDicom,
  useWorklistTest,
} from "@/features/dicom/useDicom";
import type { DicomConfigureRequest } from "@/services/apiDicom";
import {
  equipmentDicom,
  equipmentStatus,
  equipmentStatusLabel,
} from "@/services/apiEquipment";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";

// Status badge colors
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "maintenance":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "inactive":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "decommissioned":
      return "bg-red-50 text-red-700 border-red-200";
    case "pending_installation":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <FaCheckCircle className="w-4 h-4" />;
    case "maintenance":
      return <FaWrench className="w-4 h-4" />;
    case "decommissioned":
      return <FaTimesCircle className="w-4 h-4" />;
    case "pending_installation":
      return <FaClock className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function EquipmentDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const { equipment, isLoading, error, refetch } = useEquipmentDetail(params.id);
  const { deleteEquipment, isDeleting } = useDeleteEquipment();

  // Admin DICOM surface — /dicom/equipment/{id}/*, not the vendor-gated routes.
  const { status: dicomStatus } = useEquipmentDicomStatus(params.id);
  const { configureDicom, isConfiguring } = useConfigureEquipmentDicom();
  const { testConnection, isTesting } = useTestEquipmentDicom();
  const { registerModality, isRegistering } = useRegisterEquipmentModality();
  const { runWorklistTest, isRunningTest } = useWorklistTest();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConfigure, setShowConfigure] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DicomConfigureRequest>();

  // Prefill the configure form with whatever is already set.
  useEffect(() => {
    if (!dicomStatus) return;
    reset({
      ae_title: dicomStatus.ae_title ?? "",
      ip: dicomStatus.hl7_host ?? "",
      port: dicomStatus.dicom_port ?? undefined,
    });
  }, [dicomStatus, reset]);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    deleteEquipment(params.id, {
      onSuccess: () => router.push("/equipments"),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Report the real failure — a permissions or server error is not "not found".
  if (error || !equipment) {
    return (
      <ErrorState
        title="Unable to Load Equipment"
        error={error}
        message={
          !error && !equipment ? "This equipment could not be found." : undefined
        }
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  const status = equipmentStatus(equipment);
  // The dedicated DICOM status endpoint is authoritative and reflects live
  // connection state; the equipment payload is the fallback.
  const dicom = dicomStatus?.ae_title
    ? {
        ae_title: dicomStatus.ae_title ?? null,
        hl7_host: dicomStatus.hl7_host ?? null,
        hl7_port: dicomStatus.hl7_port ?? null,
        dicom_port: dicomStatus.dicom_port ?? null,
        is_connected: dicomStatus.is_connected ?? false,
        last_seen_at: dicomStatus.last_seen_at ?? null,
      }
    : equipmentDicom(equipment);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {equipment.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusBadge(
                    status,
                  )}`}
                >
                  {getStatusIcon(status)}
                  {equipmentStatusLabel(equipment)}
                </span>
                {dicom && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      dicom.is_connected
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        dicom.is_connected
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-slate-300"
                      }`}
                    />
                    {dicom.is_connected ? "Live" : "Offline"}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-mono">
                {equipment.code ?? equipment.asset_id ?? ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/equipments/${params.id}/edit`)}
              className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-2 text-sm"
            >
              <FaEdit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
            >
              <FaTrash className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdCategory className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Category</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {equipment.category_label ?? equipment.category ?? "-"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <FaIndustry className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Brand</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {equipment.brand || equipment.manufacturer || "-"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <FaCog className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Model</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {equipment.model || "-"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <FaCalendar className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Manufactured</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {formatDate(equipment.manufacture_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Serial Number Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FaBarcode className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                Serial Number
              </h2>
            </div>
            <p className="text-slate-700 font-mono">
              {equipment.serial_number || "Not specified"}
            </p>
          </div>

          {/* Description Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FaInfoCircle className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                Description
              </h2>
            </div>
            <p className="text-slate-700">
              {equipment.description || "No description provided"}
            </p>
          </div>

          {/* Specifications Section */}
          {equipment.specifications &&
            Object.keys(equipment.specifications).length > 0 && (
              <div className="p-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(equipment.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="bg-slate-50 rounded-lg p-3 flex justify-between"
                      >
                        <span className="text-sm text-slate-500 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          {String(value)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* DICOM Configuration — always shown so equipment with no DICOM
              details yet can still be configured. */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                DICOM Configuration
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowConfigure(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <FaCog className="w-3 h-3" /> Configure
                </button>
                <button
                  onClick={() => testConnection(params.id)}
                  disabled={isTesting || !dicom?.ae_title}
                  title={
                    dicom?.ae_title
                      ? undefined
                      : "Configure an AE title before testing"
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
                >
                  <FaPlug className="w-3 h-3" />
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>
                <button
                  onClick={() => runWorklistTest(params.id)}
                  disabled={isRunningTest}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors disabled:opacity-50"
                >
                  <FaListAlt className="w-3 h-3" />
                  {isRunningTest ? "Running..." : "MWL Test"}
                </button>
                <button
                  onClick={() => registerModality(params.id)}
                  disabled={isRegistering || !dicom?.ae_title}
                  title={
                    dicom?.ae_title
                      ? undefined
                      : "Configure an AE title before registering"
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors disabled:opacity-50"
                >
                  <FaCheckCircle className="w-3 h-3" />
                  {isRegistering ? "Registering..." : "Register Modality"}
                </button>
              </div>
            </div>

            {dicom ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">AE Title</p>
                  <p className="text-sm font-mono text-slate-900">
                    {dicom.ae_title || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Device Host / IP</p>
                  <p className="text-sm font-mono text-slate-900">
                    {dicom.hl7_host || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">HL7 Port</p>
                  <p className="text-sm font-mono text-slate-900">
                    {dicom.hl7_port ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">DICOM Port</p>
                  <p className="text-sm font-mono text-slate-900">
                    {dicom.dicom_port ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Connection Status</p>
                  <p className="text-sm text-slate-900">
                    {dicom.is_connected ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>
                        Not connected
                      </span>
                    )}
                  </p>
                </div>
                {dicom.last_seen_at && (
                  <div>
                    <p className="text-xs text-slate-500">Last Seen</p>
                    <p className="text-sm text-slate-900">
                      {formatDate(dicom.last_seen_at)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No DICOM details configured for this equipment yet.
              </p>
            )}
          </div>

          {/* Vendor Config (MWL Server Details) */}
          {equipment.vendor_config && (
            <div className="p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                MWL Server Configuration
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Configure your physical device with these details to receive
                worklists.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3">
                <div>
                  <p className="text-xs text-slate-500">MWL Server IP</p>
                  <p className="text-sm font-mono text-slate-900">
                    {equipment.vendor_config.mwl_server_ip}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">MWL Server Port</p>
                  <p className="text-sm font-mono text-slate-900">
                    {equipment.vendor_config.mwl_server_port}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Server AET</p>
                  <p className="text-sm font-mono text-slate-900">
                    {equipment.vendor_config.mwl_server_aet}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Equipment AET</p>
                  <p className="text-sm font-mono text-slate-900">
                    {equipment.vendor_config.equipment_aet}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500">Connection Type</p>
                  <p className="text-sm text-slate-900">
                    {equipment.vendor_config.connection_type}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configure DICOM modal */}
      {showConfigure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Configure DICOM
              </h3>
              <button
                onClick={() => setShowConfigure(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Saving registers this device as a modality in Orthanc.
            </p>

            <form
              onSubmit={handleSubmit((data) =>
                configureDicom(
                  {
                    equipmentId: params.id,
                    data: { ...data, port: Number(data.port) },
                  },
                  { onSuccess: () => setShowConfigure(false) },
                ),
              )}
              className="space-y-4"
            >
              <InputField
                label="AE Title"
                type="text"
                placeholder="e.g. GEXR001 (max 16 chars)"
                register={register("ae_title", {
                  required: "AE title is required",
                  maxLength: { value: 16, message: "Maximum 16 characters" },
                })}
                error={errors.ae_title?.message}
                required
              />
              <InputField
                label="Device IP / Host"
                type="text"
                placeholder="e.g. 192.168.1.50"
                register={register("ip", { required: "IP/host is required" })}
                error={errors.ip?.message}
                required
              />
              <InputField
                label="DICOM Port"
                type="number"
                placeholder="e.g. 11112"
                register={register("port", {
                  required: "Port is required",
                  min: { value: 1, message: "Must be between 1 and 65535" },
                  max: { value: 65535, message: "Must be between 1 and 65535" },
                })}
                error={errors.port?.message}
                required
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigure(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConfiguring}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isConfiguring ? "Saving..." : "Save & Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Delete Equipment
              </h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete &quot;{equipment.name}&quot;?
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
