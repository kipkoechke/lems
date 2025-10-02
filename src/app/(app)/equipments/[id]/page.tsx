"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEquipments } from "@/features/equipments/useEquipments";
import { useDeleteEquipment } from "@/features/equipments/useDeleteEquipment";
import {
  FaCogs,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaBarcode,
  FaIndustry,
} from "react-icons/fa";
import BackButton from "@/components/common/BackButton";

const EquipmentDetails: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { equipments = [], isLoading } = useEquipments();
  const { deleteEquipment, isDeleting } = useDeleteEquipment();

  const equipment = useMemo(
    () => equipments.find((e) => e.id === params.id),
    [equipments, params.id]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const statusBadge = (value: string) => {
    const map: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      unavailable: "bg-red-100 text-red-800",
      retired: "bg-gray-100 text-gray-800",
    };
    const cls = map[value] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${cls}`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    );
  };

  const onDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteEquipment(params.id, {
      onSuccess: () => {
        router.push("/equipments");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 text-xl mb-4">Equipment not found</div>
            <BackButton onClick={() => router.push("/equipments")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <BackButton
                  onClick={() => router.push("/equipments")}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                />
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaCogs className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {equipment.name}
                  </h1>
                  <p className="text-sm md:text-base text-blue-100">
                    Equipment Details
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/equipments/${params.id}/edit`)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={onDelete}
                  className="bg-red-500/80 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Equipment Information */}
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {equipment.name}
                    </p>
                  </div>
                  {equipment.serial_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FaBarcode className="w-4 h-4" />
                        Serial Number
                      </label>
                      <p className="text-gray-900 font-mono bg-white px-3 py-1 rounded border">
                        {equipment.serial_number}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1">{statusBadge(equipment.status)}</div>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Technical Specifications
                </h3>
                <div className="space-y-3">
                  {equipment.model && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Model
                      </label>
                      <p className="text-gray-900">{equipment.model}</p>
                    </div>
                  )}
                  {equipment.manufacturer && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FaIndustry className="w-4 h-4" />
                        Manufacturer
                      </label>
                      <p className="text-gray-900">{equipment.manufacturer}</p>
                    </div>
                  )}
                  {equipment.year && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <FaCalendar className="w-4 h-4" />
                        Year
                      </label>
                      <p className="text-gray-900">{equipment.year}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {equipment.description && (
              <div className="bg-gray-50 rounded-xl p-4 md:p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {equipment.description}
                </p>
              </div>
            )}

            {/* Vendor Information */}
            {equipment.vendor && (
              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Vendor Name
                    </label>
                    <p className="text-gray-900 font-medium">
                      {equipment.vendor.name}
                    </p>
                  </div>
                  {equipment.vendor.code && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Vendor Code
                      </label>
                      <p className="text-gray-900 font-mono bg-white px-3 py-1 rounded border">
                        {equipment.vendor.code}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-3 md:p-4 transition-all duration-300">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-4 md:p-6">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Delete Equipment
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Are you sure you want to delete &quot;{equipment.name}&quot;?
                  This action cannot be undone.
                </p>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full md:flex-1 px-4 py-2 md:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="w-full md:flex-1 px-4 py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm md:text-base"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;
