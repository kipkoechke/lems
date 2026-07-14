"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFacilityByCode } from "@/features/facilities/useFacilityByCode";
import { useUpdateFacility } from "@/features/facilities/useUpdateFacility";
import Modal from "@/components/common/Modal";
import {
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
  FaFileContract,
  FaUsers,
} from "react-icons/fa";

export default function FacilityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const facilityCode = params.facility_code as string;

  const [activeTab, setActiveTab] = useState<"contracts" | "patients">(
    "contracts",
  );

  const [editForm, setEditForm] = useState({
    name: "",
    regulatory_status: "",
    facility_type: "",
    owner: "",
    operation_status: "",
    keph_level: "",
    is_active: "1",
  });

  const {
    data: facility,
    isLoading,
    error,
  } = useFacilityByCode({ facilityCode });

  const { updateFacility, isUpdating } = useUpdateFacility();

  const handleEditClick = () => {
    if (facility) {
      setEditForm({
        name: facility.name,
        regulatory_status: facility.regulatory_status || "",
        facility_type: facility.facility_type,
        owner: facility.owner || facility.facility_ownership || "",
        operation_status: facility.operation_status || "",
        keph_level: facility.keph_level,
        is_active:
          facility.is_active === true || facility.is_active === "1"
            ? "1"
            : "0",
      });
    }
  };

  const handleSaveEdit = () => {
    if (facility) {
      updateFacility({ id: facility.id, data: editForm });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-5 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-slate-600">
              {error
                ? "Failed to load facility details."
                : `No facility found with code: ${facilityCode}`}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive =
    facility.is_active === true || facility.is_active === "1";

  const details: { label: string; value?: string | null }[] = [
    { label: "Facility Type", value: facility.facility_type },
    { label: "Ownership", value: facility.facility_ownership || facility.owner },
    { label: "KEPH Level", value: facility.keph_level },
    { label: "FR Code", value: facility.fr_code },
    { label: "Phone", value: facility.phone_number },
    { label: "Email", value: facility.email },
    { label: "County", value: facility.county?.name },
    { label: "Sub County", value: facility.sub_county?.name },
    { label: "Ward", value: facility.ward?.name },
    {
      label: "SHA Contract Status",
      value: facility.sha_contract_status || "Not specified",
    },
  ];

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
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
              {facility.name}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{facility.code}</p>
          </div>
          <span
            className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
          <Modal>
            <Modal.Open opens="edit-facility">
              <button
                onClick={handleEditClick}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FaEdit className="w-3.5 h-3.5" /> Edit Facility
              </button>
            </Modal.Open>
            <Modal.Window name="edit-facility">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Facility
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facility Type
                    </label>
                    <input
                      type="text"
                      value={editForm.facility_type}
                      onChange={(e) =>
                        handleInputChange("facility_type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KEPH Level
                    </label>
                    <input
                      type="text"
                      value={editForm.keph_level}
                      onChange={(e) =>
                        handleInputChange("keph_level", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.is_active}
                      onChange={(e) =>
                        handleInputChange("is_active", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      disabled={isUpdating}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <FaTimes className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="w-4 h-4" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Modal.Window>
          </Modal>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="text-sm font-medium text-slate-900">
                  {d.value || "-"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Created: {formatDate(facility.created_at)}</span>
            <span>Updated: {formatDate(facility.updated_at)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex gap-6 border-b border-gray-100 px-4">
            <button
              onClick={() => setActiveTab("contracts")}
              className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "contracts"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === "patients"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Patients
            </button>
          </div>

          <div className="p-6 text-center">
            {activeTab === "contracts" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <FaFileContract className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-sm text-slate-500">
                  View contracts linked to this facility
                </p>
                <button
                  onClick={() =>
                    router.push(`/contracts?facility_code=${facility.code}`)
                  }
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FaFileContract className="w-3.5 h-3.5" /> View Contracts
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <FaUsers className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm text-slate-500">
                  View patients registered at this facility
                </p>
                <button
                  onClick={() =>
                    router.push(`/patients?facility_code=${facility.code}`)
                  }
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FaUsers className="w-3.5 h-3.5" /> View Patients
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
