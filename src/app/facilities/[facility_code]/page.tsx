"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useFacilityByCode } from "@/features/facilities/useFacilityByCode";
import { FaArrowLeft, FaBuilding, FaCertificate, FaMapMarkerAlt, FaUser, FaUserMd } from "react-icons/fa";

export default function FacilityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const facilityCode = params.facility_code as string;

  const { data: facility, isLoading, error } = useFacilityByCode({
    facilityCode,
  });

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
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Facility</h2>
          <p className="text-red-600">Failed to load facility details. Please try again.</p>
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
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Facility Not Found</h2>
          <p className="text-yellow-600">No facility found with code: {facilityCode}</p>
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
      case 'licensed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending registration':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under construction':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{facility.name}</h1>
            <p className="text-lg text-gray-600">Code: {facility.code}</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.regulatory_status)}`}>
              {facility.regulatory_status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.operation_status)}`}>
              {facility.operation_status}
            </span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
              <p className="text-gray-900">{facility.facility_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <p className="text-gray-900">{facility.owner}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KEPH Level</label>
              <p className="text-gray-900">{facility.keph_level}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <p className={`inline-block px-2 py-1 rounded text-sm ${facility.is_active === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {facility.is_active === '1' ? 'Active' : 'Inactive'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Status</label>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.regulatory_status)}`}>
                {facility.regulatory_status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation Status</label>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.operation_status)}`}>
                {facility.operation_status}
              </span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">County ID</label>
              <p className="text-gray-900">{facility.county_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub County ID</label>
              <p className="text-gray-900">{facility.sub_county_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ward ID</label>
              <p className="text-gray-900">{facility.ward_id}</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">{new Date(facility.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-gray-900">{new Date(facility.updated_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility ID</label>
              <p className="text-gray-900">{facility.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push(`/contracts?facility_code=${facility.code}`)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <FaBuilding className="w-4 h-4" />
          View Contracts
        </button>
        <button
          onClick={() => router.push(`/patients?facility_code=${facility.code}`)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaUserMd className="w-4 h-4" />
          View Patients
        </button>
      </div>
    </div>
  );
}
