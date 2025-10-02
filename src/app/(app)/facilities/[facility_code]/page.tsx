"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFacilityByCode } from "@/features/facilities/useFacilityByCode";
import { useUpdateFacility } from "@/features/facilities/useUpdateFacility";
import Modal from "@/components/common/Modal";
import {
  FaArrowLeft,
  FaBuilding,
  FaCertificate,
  FaMapMarkerAlt,
  FaUser,
  FaUserMd,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

export default function FacilityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const facilityCode = params.facility_code as string;

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
  } = useFacilityByCode({
    facilityCode,
  });

  const { updateFacility, isUpdating } = useUpdateFacility();

  const handleEditClick = () => {
    if (facility) {
      setEditForm({
        name: facility.name,
        regulatory_status: facility.regulatory_status || "",
        facility_type: facility.facility_type,
        owner: facility.owner,
        operation_status: facility.operation_status || "",
        keph_level: facility.keph_level,
        is_active: facility.is_active || "1",
      });
    }
  };

  const handleSaveEdit = () => {
    if (facility) {
      updateFacility({
        id: facility.id,
        data: editForm,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Facility
          </h2>
          <p className="text-red-600">
            Failed to load facility details. Please try again.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Facility Not Found
          </h2>
          <p className="text-yellow-600">
            No facility found with code: {facilityCode}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "licensed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending registration":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "revoked":
        return "bg-red-100 text-red-800 border-red-200";
      case "operational":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "under construction":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {facility.name}
            </h1>
            <p className="text-lg text-gray-600">Code: {facility.code}</p>
          </div>
          <div className="flex items-start gap-4">
            <Modal>
              <Modal.Open opens="edit-facility">
                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit Facility
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
                        Regulatory Status
                      </label>
                      <select
                        value={editForm.regulatory_status}
                        onChange={(e) =>
                          handleInputChange("regulatory_status", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="licensed">Licensed</option>
                        <option value="pending registration">
                          Pending Registration
                        </option>
                        <option value="suspended">Suspended</option>
                        <option value="revoked">Revoked</option>
                      </select>
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
                        Owner
                      </label>
                      <input
                        type="text"
                        value={editForm.owner}
                        onChange={(e) =>
                          handleInputChange("owner", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operation Status
                      </label>
                      <select
                        value={editForm.operation_status}
                        onChange={(e) =>
                          handleInputChange("operation_status", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="operational">Operational</option>
                        <option value="closed">Closed</option>
                        <option value="under construction">
                          Under Construction
                        </option>
                      </select>
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
                        onClick={() => {}} // Modal will handle close
                        disabled={isUpdating}
                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        <FaTimes className="w-4 h-4" />
                        Cancel
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
                            <FaSave className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Modal.Window>
            </Modal>
            <div className="flex flex-col gap-2">
              {facility.regulatory_status && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    facility.regulatory_status
                  )}`}
                >
                  {facility.regulatory_status}
                </span>
              )}
              {facility.operation_status && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    facility.operation_status
                  )}`}
                >
                  {facility.operation_status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding className="w-5 h-5 text-indigo-600" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Type
              </label>
              <p className="text-gray-900">{facility.facility_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <p className="text-gray-900">{facility.owner}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KEPH Level
              </label>
              <p className="text-gray-900">{facility.keph_level}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <p
                className={`inline-block px-2 py-1 rounded text-sm ${
                  facility.is_active === "1"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {facility.is_active === "1" ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory & Operational Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCertificate className="w-5 h-5 text-green-600" />
            Regulatory & Operational Status
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regulatory Status
              </label>
              {facility.regulatory_status ? (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    facility.regulatory_status
                  )}`}
                >
                  {facility.regulatory_status}
                </span>
              ) : (
                <p className="text-gray-500 italic">Not specified</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation Status
              </label>
              {facility.operation_status ? (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    facility.operation_status
                  )}`}
                >
                  {facility.operation_status}
                </span>
              ) : (
                <p className="text-gray-500 italic">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
            Location
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <p className="text-gray-900">
                {facility.county?.name || "Not specified"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub County
              </label>
              <p className="text-gray-900">
                {facility.county?.subcounty?.name || "Not specified"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <p className="text-gray-900">
                {facility.county?.subcounty?.ward?.name || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="w-5 h-5 text-gray-600" />
            System Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created At
              </label>
              <p className="text-gray-900">
                {facility.created_at
                  ? new Date(facility.created_at).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">
                {facility.updated_at
                  ? new Date(facility.updated_at).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility ID
              </label>
              <p className="text-gray-900">{facility.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() =>
            router.push(`/contracts?facility_code=${facility.code}`)
          }
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FaBuilding className="w-4 h-4" />
          View Contracts
        </button>
        <button
          onClick={() =>
            router.push(`/patients?facility_code=${facility.code}`)
          }
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaUserMd className="w-4 h-4" />
          View Patients
        </button>
      </div>

      {/* Edit Modal */}
      <Modal>
        <Modal.Open opens="edit-facility">
          <button
            onClick={handleEditClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaEdit className="w-4 h-4" />
            Edit Facility
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
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regulatory Status
                </label>
                <select
                  value={editForm.regulatory_status}
                  onChange={(e) =>
                    handleInputChange("regulatory_status", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="licensed">Licensed</option>
                  <option value="pending registration">
                    Pending Registration
                  </option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                </select>
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
                  Owner
                </label>
                <input
                  type="text"
                  value={editForm.owner}
                  onChange={(e) => handleInputChange("owner", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operation Status
                </label>
                <select
                  value={editForm.operation_status}
                  onChange={(e) =>
                    handleInputChange("operation_status", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="operational">Operational</option>
                  <option value="closed">Closed</option>
                  <option value="under construction">Under Construction</option>
                </select>
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
                  <FaTimes className="w-4 h-4" />
                  Cancel
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
                      <FaSave className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal.Window>
      </Modal>
    </div>
  );
}
