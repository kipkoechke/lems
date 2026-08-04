"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useFacilityByCode } from "@/features/facilities/useFacilityByCode";
import { useUpdateFacility } from "@/features/facilities/useUpdateFacility";
import type { EditFacilityForm } from "@/services/apiFacility";

const KEPH_LEVELS = [
  { value: "1", label: "Level 1" },
  { value: "2", label: "Level 2" },
  { value: "3", label: "Level 3" },
  { value: "4", label: "Level 4" },
  { value: "5", label: "Level 5" },
  { value: "6", label: "Level 6" },
];

const FACILITY_TYPES = [
  "National Referral Hospital",
  "County Referral Hospital",
  "Sub-County Hospital",
  "Health Centre",
  "Dispensary",
  "Clinic",
  "Medical Centre",
  "Nursing Home",
];

const OPERATION_STATUSES = [
  "Operational",
  "Closed",
  "Under Construction",
  "Under Renovation",
];

const REGULATORY_STATUSES = [
  "Licensed",
  "Provisional License",
  "Not Licensed",
  "Exempt",
];

export default function EditFacilityPage() {
  const router = useRouter();
  const params = useParams();
  const facilityCode = params?.facility_code as string;

  const { data: facility, isLoading, error: fetchError } = useFacilityByCode({ facilityCode });
  const { updateFacility, isUpdating } = useUpdateFacility();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFacilityForm>();

  // Pre-fill form when facility data loads
  useEffect(() => {
    if (facility) {
      reset({
        name: facility.name || "",
        code: facility.code || "",
        county_id: facility.county?.id || "",
        sub_county_id: facility.sub_county?.id || "",
        ward_id: facility.ward?.id || "",
        keph_level: String(facility.keph_level || ""),
        facility_type: facility.facility_type || "",
        owner: facility.facility_ownership || facility.owner || "",
        operation_status: facility.operation_status || "Operational",
        regulatory_status: facility.sha_contract_status || "Licensed",
        is_active: facility.is_active ? "true" : "false",
      });
    }
  }, [facility, reset]);

  const onSubmit = (data: EditFacilityForm) => {
    updateFacility(
      { id: facility?.id || facilityCode, data },
      {
        onSuccess: () => router.push(`/facilities/${facilityCode}`),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError || !facility) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Facility Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {fetchError ? "Error loading facility." : "The facility you're trying to edit doesn't exist."}
          </p>
          <Link
            href="/facilities"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Facilities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate
      permission={Permission.ONBOARD_FACILITY}
      fallback={
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to edit facilities.
            </p>
            <Link
              href={`/facilities/${facilityCode}`}
              className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
            >
              Back to Facility Details
            </Link>
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/facilities" className="hover:text-blue-600">
              Facilities
            </Link>
            <span>/</span>
            <Link
              href={`/facilities/${facilityCode}`}
              className="hover:text-blue-600"
            >
              {facility.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">Edit</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Facility</h1>
          <p className="text-gray-600 mt-2">Update facility information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Name *
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Facility name is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter facility name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Code *
                </label>
                <input
                  type="text"
                  {...register("code", {
                    required: "Facility code is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter facility code"
                />
                {errors.code && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KEPH Level *
                </label>
                <select
                  {...register("keph_level", {
                    required: "KEPH level is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select KEPH Level</option>
                  {KEPH_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                {errors.keph_level && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.keph_level.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Type *
                </label>
                <select
                  {...register("facility_type", {
                    required: "Facility type is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Facility Type</option>
                  {FACILITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.facility_type && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.facility_type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership *
                </label>
                <select
                  {...register("owner", {
                    required: "Ownership is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Ownership</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Faith Based">Faith Based</option>
                  <option value="NGO">NGO</option>
                  <option value="Parastatal">Parastatal</option>
                  <option value="Military">Military</option>
                </select>
                {errors.owner && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.owner.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation Status
                </label>
                <select
                  {...register("operation_status")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {OPERATION_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regulatory Status
                </label>
                <select
                  {...register("regulatory_status")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REGULATORY_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Status
                </label>
                <select
                  {...register("is_active")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push(`/facilities/${facilityCode}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
