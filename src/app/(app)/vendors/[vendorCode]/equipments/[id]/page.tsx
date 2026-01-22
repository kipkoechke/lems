"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaCog,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaWrench,
  FaTimesCircle,
  FaClock,
  FaCalendar,
  FaBarcode,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";
import { useVendor } from "@/features/vendors/useVendor";
import {
  useVendorEquipment,
  useDeleteVendorEquipment,
} from "@/features/vendors/useVendorEquipments";
import BackButton from "@/components/common/BackButton";

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
      return <FaCog className="w-4 h-4" />;
  }
};

export default function VendorEquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;
  const equipmentId = params.id as string;

  const { vendor, isLoading: vendorLoading } = useVendor(vendorCode);
  const {
    data: equipment,
    isLoading: equipmentLoading,
    error: equipmentError,
  } = useVendorEquipment(vendor?.id || "", equipmentId);
  const deleteEquipmentMutation = useDeleteVendorEquipment();

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    if (!vendor?.id || !equipmentId) return;
    deleteEquipmentMutation.mutate(
      { vendorId: vendor.id, equipmentId },
      {
        onSuccess: () => {
          router.push(`/vendors/${vendorCode}/equipments`);
        },
      }
    );
  };

  const isLoading = vendorLoading || equipmentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 text-sm">Loading equipment...</p>
        </div>
      </div>
    );
  }

  if (equipmentError || !equipment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-slate-600">Equipment not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{equipment.name}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                  equipment.status
                )}`}
              >
                {getStatusIcon(equipment.status)}
                {equipment.status_label}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-mono">{equipment.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/vendors/${vendorCode}/equipments/${equipmentId}/edit`)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            <FaEdit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            <FaTrash className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
            <FaTag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Category</p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {equipment.category_label}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
            <FaCog className="w-4 h-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Brand</p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {equipment.brand || "-"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
            <FaBarcode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Serial Number</p>
            <p className="text-sm font-medium text-slate-900 truncate font-mono">
              {equipment.serial_number || "-"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
            <FaCalendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Manufactured</p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {formatDate(equipment.manufacture_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        {/* Details Section */}
        <div className="border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Model</p>
              <p className="text-sm text-slate-900">{equipment.model || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Vendor</p>
              <p className="text-sm text-slate-900">{vendor?.name || "-"}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {equipment.description && (
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FaInfoCircle className="w-3 h-3 text-slate-400" />
              Description
            </h2>
            <p className="text-sm text-slate-700">{equipment.description}</p>
          </div>
        )}

        {/* Specifications */}
        {equipment.specifications &&
          Object.keys(equipment.specifications).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm text-slate-600 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Equipment
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Are you sure you want to delete &ldquo;{equipment.name}&rdquo;? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteEquipmentMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteEquipmentMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
