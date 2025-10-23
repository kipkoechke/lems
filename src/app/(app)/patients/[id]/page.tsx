"use client";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { usePatient } from "@/features/patients/usePatient";
import { useRouter, useParams } from "next/navigation";
import {
  FaUser,
  FaPhone,
  FaCalendar,
  FaEdit,
  FaMedkit,
  FaEnvelope,
  FaIdCard,
  FaMapMarkerAlt,
  FaVenusMars,
  FaHeart,
  FaFlag,
  FaWallet,
  FaHome,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import { maskPhoneNumber, maskEmail, maskIdNumber } from "@/lib/maskUtils";
import { formatDateOnlyNairobi } from "@/lib/dateUtils";

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
                <p className="text-gray-900 font-medium text-lg">
                  {patient.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <p className="text-gray-900">{patient.first_name || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <p className="text-gray-900">{patient.middle_name || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900">{patient.last_name || "-"}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaCalendar className="w-3 h-3 text-gray-500" />
                  Date of Birth
                </label>
                <p className="text-gray-900">
                  {formatDateOnlyNairobi(patient.date_of_birth)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Age:{" "}
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(patient.date_of_birth).getTime()) /
                      (365.25 * 24 * 60 * 60 * 1000)
                  )}{" "}
                  years
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaVenusMars className="w-3 h-3 text-gray-500" />
                  Gender
                </label>
                <p className="text-gray-900">{patient.gender || "-"}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaHeart className="w-3 h-3 text-gray-500" />
                  Civil Status
                </label>
                <p className="text-gray-900">{patient.civil_status || "-"}</p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaFlag className="w-3 h-3 text-gray-500" />
                  Citizenship
                </label>
                <p className="text-gray-900">{patient.citizenship || "-"}</p>
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="w-3 h-3 text-gray-500" />
                  Phone Number
                </label>
                <p className="text-gray-900 font-mono">
                  {patient.phone ? maskPhoneNumber(patient.phone) : "-"}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="w-3 h-3 text-gray-500" />
                  Email Address
                </label>
                <p className="text-gray-900">
                  {patient.email ? maskEmail(patient.email) : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Identification Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FaIdCard className="w-4 h-4 text-indigo-600" />
              </div>
              Identification Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identification Type
                </label>
                <p className="text-gray-900">
                  {patient.identification_type || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identification Number
                </label>
                <p className="text-gray-900 font-mono">
                  {patient.identification_no
                    ? maskIdNumber(patient.identification_no)
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* SHA & Insurance Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaMedkit className="w-4 h-4 text-purple-600" />
              </div>
              Medical & Insurance Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SHA Number
                </label>
                {patient.sha_number ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {patient.sha_number}
                  </span>
                ) : (
                  <p className="text-gray-400">Not assigned</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CR Number
                </label>
                <p className="text-gray-900 font-mono">
                  {patient.cr_no || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HH Number
                </label>
                <p className="text-gray-900 font-mono">
                  {patient.hh_no || "-"}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaWallet className="w-3 h-3 text-gray-500" />
                  Wallet ID
                </label>
                <p className="text-gray-900 font-mono">
                  {patient.wallet_id || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaMapMarkerAlt className="w-4 h-4 text-orange-600" />
              </div>
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {patient.county_id || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub County ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {patient.sub_county_id || "-"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward ID
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {patient.ward_id || "-"}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FaHome className="w-3 h-3 text-gray-500" />
                  Village/Estate
                </label>
                <p className="text-gray-900">{patient.village_estate || "-"}</p>
              </div>
            </div>
          </div>

          {/* Registration Information */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FaFileAlt className="w-4 h-4 text-gray-600" />
              </div>
              System Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <p className="text-gray-900 font-mono text-sm break-all">
                  {patient.id}
                </p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    patient.deleted_at
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {patient.deleted_at ? "Inactive" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                <FaClipboardList className="w-4 h-4 text-teal-600" />
              </div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/patients/${params.id}/bookings`)}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
              >
                <FaCalendar className="w-5 h-5" />
                <span className="font-medium">View Bookings</span>
              </button>
              <button
                onClick={() => router.push(`/patients/${params.id}/edit`)}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg"
              >
                <FaEdit className="w-5 h-5" />
                <span className="font-medium">Edit Patient</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
