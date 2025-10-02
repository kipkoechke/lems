"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useVendors } from "@/features/vendors/useVendors";
import { useUpdateVendor } from "@/features/vendors/useUpdateVendor";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useState, useEffect } from "react";
import { FaBuilding, FaSave, FaTimes } from "react-icons/fa";

const vendorFormSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  code: z.string().min(1, "Vendor code is required"),
  is_active: z.boolean(),
});

type VendorFormData = z.infer<typeof vendorFormSchema>;

function EditVendorContent() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vendors, isLoading, error } = useVendors();
  const { updateVendor, isUpdating, error: updateError } = useUpdateVendor();

  // Find the specific vendor from the vendors array
  const vendor = vendors?.find((v) => v.code === vendorCode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      code: "",
      is_active: true,
    },
  });

  // Populate form with vendor data when available
  useEffect(() => {
    if (vendor) {
      setValue("name", vendor.name);
      setValue("code", vendor.code);
      setValue("is_active", vendor.is_active === "1");
    }
  }, [vendor, setValue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Failed to load vendor details</p>
          <BackButton onClick={() => router.back()} />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-yellow-500 text-xl mb-2">🔍</div>
          <p className="text-gray-600">Vendor not found</p>
          <BackButton onClick={() => router.back()} />
        </div>
      </div>
    );
  }

  const onSubmit = (data: VendorFormData) => {
    setIsSubmitting(true);
    updateVendor(
      {
        id: vendor.id,
        name: data.name,
        code: data.code,
        is_active: data.is_active ? "1" : "0",
      },
      {
        onSuccess: () => {
          router.push(`/vendors/${vendorCode}`);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const isActive = watch("is_active");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <BackButton onClick={() => router.back()} />
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaBuilding className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Edit Vendor</h1>
              <p className="text-gray-600 mt-2">Update vendor information</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Vendor Information
            </h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vendor Code */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Vendor Code *
                </label>
                <input
                  type="text"
                  {...register("code")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.code
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter vendor code"
                />
                {errors.code && (
                  <p className="text-red-600 text-sm">{errors.code.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Uncheck to deactivate this vendor
                </p>
              </div>

              {/* Vendor Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter vendor name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push(`/vendors/${vendorCode}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {(isSubmitting || isUpdating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <FaSave className="w-4 h-4" />
                <span>
                  {isSubmitting || isUpdating ? "Updating..." : "Update Vendor"}
                </span>
              </button>
            </div>

            {/* Error Message */}
            {updateError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">
                  Failed to update vendor. Please try again.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditVendorPage() {
  return (
    <PermissionGate permission={Permission.ONBOARD_VENDORS}>
      <EditVendorContent />
    </PermissionGate>
  );
}
