"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useVendorEquipment } from "@/features/vendors/useVendorEquipments";
import {
  useConfigureVendorEquipmentDicom,
  useTestVendorEquipmentConnection,
  useVendorEquipmentDicomStatus,
  useVendorWorklistTest,
} from "@/features/vendors/useVendorEquipmentDicom";
import { VendorDicomConfigureRequest } from "@/services/apiEquipment";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";
import {
  FaArrowLeft,
  FaCog,
  FaEdit,
  FaPlug,
  FaListAlt,
  FaTimes,
} from "react-icons/fa";

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
    : "Never";

function VendorEquipmentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const equipmentId = params.id as string;

  const [showConfigure, setShowConfigure] = useState(false);

  // 1. Equipment metadata — the /vendor/* routes infer the vendor from the
  //    auth token, so no vendor id is needed here.
  const {
    data: equipment,
    isLoading,
    error,
  } = useVendorEquipment("", equipmentId);

  // 2. DICOM state (AE title, IP/port, Orthanc registration, MWL config)
  const { dicom, isLoading: dicomLoading } =
    useVendorEquipmentDicomStatus(equipmentId);

  const { configureDicom, isConfiguring } =
    useConfigureVendorEquipmentDicom(equipmentId);
  const { testConnection, isTesting } =
    useTestVendorEquipmentConnection(equipmentId);
  const { runWorklistTest, isRunningTest } = useVendorWorklistTest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorDicomConfigureRequest>();

  useEffect(() => {
    if (dicom) {
      reset({
        ae_title: dicom.ae_title ?? "",
        ip: dicom.ip ?? dicom.hl7_host ?? "",
        port: dicom.port ?? dicom.dicom_port ?? undefined,
      });
    }
  }, [dicom, reset]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <ErrorState
        title="Unable to Load Equipment"
        error={error}
        message={!error && !equipment ? "Equipment not found" : undefined}
        action={{
          label: "Back to My Equipment",
          onClick: () => router.push("/vendor/equipments"),
        }}
        fullScreen
      />
    );
  }

  const isConnected = dicom?.is_connected ?? equipment.dicom?.is_connected;
  const mwl = dicom?.mwl_server ?? dicom?.vendor_config ?? equipment.vendor_config;
  const registered = dicom?.registered_in_orthanc ?? dicom?.orthanc_registered ?? dicom?.registered;
  const guide = dicom?.configuration_guide;

  const details = [
    { label: "Code", value: equipment.code },
    { label: "Category", value: equipment.category_label },
    { label: "Modality", value: equipment.modality },
    { label: "Serial Number", value: equipment.serial_number },
    { label: "Model", value: equipment.model },
    { label: "Brand", value: equipment.brand },
  ];

  const dicomFields = [
    { label: "AE Title", value: dicom?.ae_title ?? equipment.dicom?.ae_title },
    {
      label: "Device IP / Host",
      value: dicom?.ip ?? dicom?.hl7_host ?? equipment.dicom?.hl7_host,
    },
    {
      label: "DICOM Port",
      value: (dicom?.port ?? dicom?.dicom_port ?? equipment.dicom?.dicom_port)
        ?.toString(),
    },
    {
      label: "Orthanc Registered",
      value:
        registered === undefined ? undefined : registered ? "Yes" : "No",
    },
    { label: "Last Seen", value: formatDateTime(dicom?.last_seen_at) },
  ];

  const configHighlights = [
    { label: "Status", value: equipment.status_label, color: isConnected ? "text-emerald-700" : "text-slate-700" },
    { label: "Connection", value: isConnected ? "Live" : "Offline", color: isConnected ? "text-emerald-700" : "text-slate-500" },
    { label: "Category", value: equipment.category_label },
    { label: "Modality", value: equipment.modality },
    { label: "AE Title", value: dicom?.ae_title ?? equipment.dicom?.ae_title ?? "Not configured" },
    { label: "DICOM Port", value: (dicom?.port ?? dicom?.dicom_port ?? equipment.dicom?.dicom_port)?.toString() ?? "-" },
    { label: "Orthanc", value: registered === undefined ? "-" : registered ? "Registered" : "Not Registered" },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Left column: Main content (75%) */}
        <div className="w-full lg:w-3/4 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {equipment.name}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{equipment.code}</p>
          </div>

          <span
            className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
              STATUS_BADGE[equipment.status] ??
              "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {equipment.status_label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-500 border-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            {isConnected ? "Live" : "Offline"}
          </span>

          <button
            onClick={() => router.push(`/vendor/equipments/${equipmentId}/edit`)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaEdit className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Equipment metadata */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="text-sm font-medium text-slate-900 break-words">
                  {d.value || "-"}
                </p>
              </div>
            ))}
          </div>
          {equipment.description && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Description</p>
              <p className="text-sm text-slate-700">{equipment.description}</p>
            </div>
          )}
        </div>

        {/* DICOM */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FaCog className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                DICOM Configuration
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowConfigure(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <FaCog className="w-3 h-3" /> Configure
              </button>
              <button
                onClick={() => testConnection()}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
              >
                <FaPlug className="w-3 h-3" />
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              <button
                onClick={() => runWorklistTest(equipmentId)}
                disabled={isRunningTest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors disabled:opacity-50"
              >
                <FaListAlt className="w-3 h-3" />
                {isRunningTest ? "Running..." : "MWL Test"}
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {dicomLoading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-5 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {dicomFields.map((d) => (
                  <div key={d.label}>
                    <p className="text-xs text-slate-500">{d.label}</p>
                    <p className="text-sm font-medium text-slate-900 font-mono break-words">
                      {d.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration guide — API-driven setup instructions */}
        {guide && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-4 md:px-6 py-3 border-b border-slate-100 bg-blue-50/50">
              <h2 className="text-sm font-semibold text-slate-900">
                {guide.title}
              </h2>
            </div>
            <div className="p-4 md:p-6 space-y-5">
              {guide.steps.map((step) => (
                <div key={step.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold">{step.step}</span>
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <p className="text-sm font-semibold text-slate-900">
                      {step.label}
                    </p>
                    {step.section && (
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {step.section}
                      </p>
                    )}
                    {/* Single field + value (steps 1, 4, 5) */}
                    {step.field && step.value && (
                      <div className="bg-slate-50 rounded-md px-3 py-2">
                        <p className="text-xs text-slate-500">{step.field}</p>
                        <p className="text-sm font-mono font-medium text-slate-900">
                          {step.value}
                        </p>
                      </div>
                    )}
                    {/* Multi-field table (steps 2, 3) */}
                    {step.fields && step.fields.length > 0 && (
                      <div className="bg-slate-50 rounded-md overflow-hidden border border-slate-100">
                        <table className="w-full text-sm">
                          <tbody>
                            {step.fields.map((f, i) => (
                              <tr
                                key={f.label}
                                className={i > 0 ? "border-t border-slate-100" : ""}
                              >
                                <td className="px-3 py-2 text-xs text-slate-500 w-28">
                                  {f.label}
                                </td>
                                <td className="px-3 py-2 font-mono font-medium text-slate-900">
                                  {f.value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {step.note && (
                      <p className="text-xs text-slate-500">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: legacy MWL server config */}
        {!guide && mwl && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-1">
              MWL Server Configuration
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Configure the physical device with these details to receive
              worklists.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 bg-slate-50 rounded-lg p-3">
              {[
                { label: "MWL Server IP", value: mwl.mwl_server_ip },
                { label: "MWL Server Port", value: mwl.mwl_server_port },
                { label: "Server AET", value: mwl.mwl_server_aet },
                { label: "Equipment AET", value: mwl.equipment_aet },
                { label: "Connection Type", value: mwl.connection_type },
              ].map((d) => (
                <div key={d.label}>
                  <p className="text-xs text-slate-500">{d.label}</p>
                  <p className="text-sm font-mono text-slate-900 break-words">
                    {d.value ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div> {/* End left column (75%) */}

      {/* Configure modal */}
      {showConfigure && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Configure DICOM
              </h3>
              <button
                onClick={() => setShowConfigure(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Saving registers this device as a modality in Orthanc.
            </p>

            <form
              onSubmit={handleSubmit((data) =>
                configureDicom(
                  { ...data, port: Number(data.port) },
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

        {/* Right column: Configuration Card (25%) */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FaCog className="w-3.5 h-3.5 text-slate-400" />
              Configuration
            </h3>
            <div className="space-y-1">
              {configHighlights.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`text-xs font-medium ${item.color ?? "text-slate-900"}`}>
                    {item.value || "-"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setShowConfigure(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <FaCog className="w-3 h-3" /> Configure DICOM
              </button>
              <button
                onClick={() => router.push(`/vendor/equipments/${equipmentId}/edit`)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <FaEdit className="w-3 h-3" /> Edit Equipment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorEquipmentDetailPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_EQUIPMENTS}>
      <VendorEquipmentDetailContent />
    </PermissionGate>
  );
}
