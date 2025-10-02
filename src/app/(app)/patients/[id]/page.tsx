"use client";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { usePatient } from "@/features/patients/usePatient";
import { useRouter, useParams } from "next/navigation";
import { FaUser, FaPhone, FaCalendar, FaEdit, FaMedkit } from "react-icons/fa";
import PatientBookings from "@/features/patients/PatientBookings";

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { patient, isLoading, error } = usePatient(params.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patient details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <p className="text-red-600">
                Error loading patient: {error?.message || "Patient not found"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <BackButton onClick={() => router.back()} />
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaUser className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Patient Details
                  </h1>
                  <p className="text-sm md:text-base text-blue-100">
                    View patient information and medical records
                  </p>
                </div>
              </div>
              <PermissionGate permission={Permission.VIEW_PATIENTS}>
                <button
                  onClick={() => router.push(`/patients/${params.id}/edit`)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Patient</span>
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid gap-4 md:gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUser className="w-4 h-4 text-blue-600" />
              </div>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 font-medium">{patient.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <p className="text-gray-900">
                  {new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <p className="text-gray-900 font-mono">
                  {patient.id.slice(-8)}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FaPhone className="w-4 h-4 text-green-600" />
              </div>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <FaPhone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SHA Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaMedkit className="w-4 h-4 text-purple-600" />
              </div>
              SHA Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SHA Number
              </label>
              {patient.sha_number ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {patient.sha_number}
                </span>
              ) : (
                <p className="text-gray-400">No SHA number provided</p>
              )}
            </div>
          </div>

          {/* Registration Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaCalendar className="w-4 h-4 text-gray-600" />
              </div>
              Registration Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <p className="text-gray-900 font-mono">{patient.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <p className="text-gray-900">
                  {new Date(patient.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {new Date(patient.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PatientBookings />
    </div>
  );
}
