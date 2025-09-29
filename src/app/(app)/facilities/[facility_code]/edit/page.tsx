"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";

interface FacilityFormData {
  name: string;
  code: string;
  location: string;
  phone?: string;
  email?: string;
  kephLevel: string;
  facilityType: string;
  description?: string;
  status: string;
}

// Mock facility data - replace with actual API call
const mockFacility = {
  id: "1",
  name: "City General Hospital",
  code: "CGH001",
  location: "Downtown Nairobi",
  phone: "+254712345678",
  email: "info@citygeneral.co.ke",
  kephLevel: "5",
  facilityType: "Hospital",
  description:
    "A comprehensive healthcare facility providing specialized medical services to the community.",
  status: "Active",
};

export default function EditFacilityPage() {
  const router = useRouter();
  const params = useParams();
  const facilityId = params?.facility_code as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Replace with actual API call to fetch facility data
  const facility = mockFacility;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacilityFormData>({
    defaultValues: {
      name: facility.name,
      code: facility.code,
      location: facility.location,
      phone: facility.phone,
      email: facility.email,
      kephLevel: facility.kephLevel,
      facilityType: facility.facilityType,
      description: facility.description,
      status: facility.status,
    },
  });

  const onSubmit = async (data: FacilityFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log("Updating facility:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to facility details page
      router.push(`/facilities/${facilityId}`);
    } catch (error) {
      console.error("Error updating facility:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!facility) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Facility Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The facility you&apos;re trying to edit doesn&apos;t exist.
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
              href={`/facilities/${facilityId}`}
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
              href={`/facilities/${facilityId}`}
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

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KEPH Level *
                </label>
                <select
                  {...register("kephLevel", {
                    required: "KEPH level is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select KEPH Level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                  <option value="6">Level 6</option>
                </select>
                {errors.kephLevel && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.kephLevel.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility Type *
                </label>
                <select
                  {...register("facilityType", {
                    required: "Facility type is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Facility Type</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Health Center">Health Center</option>
                  <option value="Dispensary">Dispensary</option>
                  <option value="Medical Center">Medical Center</option>
                </select>
                {errors.facilityType && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.facilityType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                {errors.status && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter facility description (optional)"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push(`/facilities/${facilityId}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
