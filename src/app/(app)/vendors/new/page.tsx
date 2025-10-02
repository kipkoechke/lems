"use client";

import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateVendor } from "@/features/vendors/useCreateVendor";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaBuilding, FaSave, FaTimes } from "react-icons/fa";
import { vendorSchema, VendorFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";

function NewVendorContent() {
  const router = useRouter();
  const { createVendor, isCreating } = useCreateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = (data: VendorFormData) => {
    createVendor(
      {
        ...data,
        is_active: data.is_active ? "1" : "0",
      },
      {
        onSuccess: () => {
          router.push("/vendors");
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
              <h1 className="text-4xl font-bold text-gray-900">
                Add New Vendor
              </h1>
              <p className="text-gray-600 mt-2">Create a new vendor profile</p>
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
                <InputField
                  label="Vendor Code"
                  type="text"
                  placeholder="Enter vendor code"
                  register={register("code")}
                  error={errors.code?.message}
                  required
                  disabled={isCreating}
                />
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
                  Check to make this vendor active
                </p>
              </div>

              {/* Vendor Name */}
              <div className="space-y-2 md:col-span-2">
                <InputField
                  label="Vendor Name"
                  type="text"
                  placeholder="Enter vendor name"
                  register={register("name")}
                  error={errors.name?.message}
                  required
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/vendors")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCreating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <FaSave className="w-4 h-4" />
                <span>{isCreating ? "Creating..." : "Create Vendor"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewVendorPage() {
  return (
    <PermissionGate permission={Permission.ONBOARD_VENDORS}>
      <NewVendorContent />
    </PermissionGate>
  );
}
