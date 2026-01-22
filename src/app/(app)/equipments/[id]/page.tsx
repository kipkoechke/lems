"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "react-icons/fa";
import { MdCategory } from "react-icons/md";
import BackButton from "@/components/common/BackButton";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useVendorEquipment,
  useDeleteVendorEquipment,
} from "@/features/vendors/useVendorEquipments";

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
  const user = useCurrentUser();
  const vendorId = user?.entity?.id || "";

  const {
    data: equipment,
    isLoading,
    error,
  } = useVendorEquipment(vendorId, params.id);
  const deleteEquipmentMutation = useDeleteVendorEquipment();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    if (!vendorId) return;
    deleteEquipmentMutation.mutate(
      { vendorId, equipmentId: params.id },
      {
        onSuccess: () => {
          router.push("/equipments");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
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

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-slate-600">Equipment not found</p>
            <button
              onClick={() => router.push("/equipments")}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to Equipment List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                    equipment.status,
                  )}`}
                >
                  {getStatusIcon(equipment.status)}
                  {equipment.status_label}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-mono">
                {equipment.code}
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
                {equipment.category_label}
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
                {equipment.brand || "-"}
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
              <div className="p-4">
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
        </div>
      </div>

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
                  disabled={deleteEquipmentMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {deleteEquipmentMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
