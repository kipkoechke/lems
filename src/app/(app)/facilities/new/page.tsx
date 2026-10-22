"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateFacility } from "@/features/facilities/useCreateFacility";
import { CreateFacilityPayload } from "@/services/apiFacility";
import { facilitySchema, FacilityFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";

export default function NewFacilityPage() {
  const router = useRouter();
  const { createFacility, isCreating } = useCreateFacility();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    mode: "onBlur",
  });

  const onSubmit = (data: FacilityFormData) => {
    const payload: CreateFacilityPayload = {
      fr_code: data.fr_code.trim(),
    };

    createFacility(payload, {
      onSuccess: () => {
        router.push("/facilities");
      },
    });
  };

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
              You don&apos;t have permission to create facilities.
            </p>
            <Link
              href="/facilities"
              className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
            >
              Back to Facilities
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
            <span className="text-gray-900">New Facility</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Facility</h1>
          <p className="text-gray-600 mt-2">
            Add a facility from the Facility Registry using its FR code
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Facility Registry
              </h3>
              <div className="max-w-md">
                <InputField
                  label="FR Code"
                  type="text"
                  placeholder="e.g. FID-22-108646-7"
                  register={register("fr_code")}
                  error={errors.fr_code?.message}
                  required
                  disabled={isCreating}
                />
                <p className="text-sm text-gray-500 mt-2">
                  The facility name, classification and location are pulled
                  from the Facility Registry using this code.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push("/facilities")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
